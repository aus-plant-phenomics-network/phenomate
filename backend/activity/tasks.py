import shutil
import traceback
from pathlib import Path
from typing import cast

from appm import ProjectManager
from appm.exceptions import FileFormatMismatch
from phenomate_core import get_preprocessor

from backend.activity.models import Activity
from celery import shared_task


@shared_task
def remove_task(log_pk: int) -> None:
    log = Activity.objects.get(pk=log_pk)
    src = Path(log.filename)
    src.unlink()
    log.status = Activity.StatusChoices.COMPLETED
    log.save()


@shared_task
def preprocess_task(log_pk: int) -> int:
    log = Activity.objects.get(pk=log_pk)
    try:
        src = Path(log.filename)
        dst = Path(log.target)
        manager = ProjectManager.load_project(log.project.location)
        name = src.name
        components = manager.match(name)
        if "sensor" not in components or components["sensor"] is None:
            raise ValueError("Missing component information for preprocessing")
        processor_class = get_preprocessor(
            components["sensor"], cast("str", components.get("rest", ""))
        )
        processor = processor_class(src)
        processor.extract()
        processor.save(dst)
        log.status = Activity.StatusChoices.COMPLETED
        # Queue next task
        next_log = Activity.objects.create(
            activity=Activity.ActivityChoices.REMOVED,
            project=log.project,
            parent=log,
            filename=log.filename,
            status=Activity.StatusChoices.QUEUED,
        )
        # Save logs to db
        next_log.save()
        log.save()
        return next_log.pk
    except Exception:
        log.status = Activity.StatusChoices.ERROR
        log.error_log = traceback.format_exc()
        log.save()
        raise


@shared_task
def copy_task(log_pk: int) -> int:
    log = Activity.objects.get(pk=log_pk)
    dst = Path(log.target)
    src = Path(log.filename)
    name = src.name
    manager = ProjectManager.load_project(dst)
    try:
        # If file can be parsed -> put to the correct location and initiate preprocessing
        dst_path = manager.copy_file(src)
        file_path = dst_path / name
        log.status = Activity.StatusChoices.COMPLETED
        log.target = str(dst_path.absolute())
        # Queue next task
        next_log = Activity.objects.create(
            activity=Activity.ActivityChoices.PREPROCESSED,
            project=log.project,
            parent=log,
            filename=str(file_path.absolute()),
            target=str(dst_path.absolute()),
            status=Activity.StatusChoices.QUEUED,
        )
        # Save logs to db
        next_log.save()
        log.save()
        return next_log.pk
    except FileFormatMismatch:
        # If file cannot be matched -> dumped at root dir
        shutil.copy2(src, dst)
        log.status = Activity.StatusChoices.COMPLETED
        log.target = str(dst.absolute())
        log.save()
        raise
    except Exception:
        # Uncatched exception -> log error
        log.status = Activity.StatusChoices.ERROR
        log.error_log = traceback.format_exc()
        log.save()
        raise
