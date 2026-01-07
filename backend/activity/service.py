from pathlib import Path

from django.db import transaction

from backend.activity.models import Activity
from backend.activity.tasks import copy_task, preprocess_task, remove_task
from backend.project.models import Project
from celery import chain, group

from celery.utils.log import get_task_logger
shared_logger = get_task_logger(__name__)


def copy_data(src: list[Path], project: Project) -> None:
    all_items: set[Path] = set()
    failed_jobs: list[Activity] = []
    queued_jobs: list[Activity] = []
    for item in src:
        if not item.exists():
            log = Activity(
                project=project,
                filename=str(item.absolute()),
                target=project.location,
                status=Activity.StatusChoices.ERROR,
                error_log=f"Does not exist: {item.absolute()}",
            )
            failed_jobs.append(log)
        elif item.is_file():
            all_items.add(item)
        elif item.is_dir():
            all_items.update(set(item.rglob("*")))
    for file in all_items:
        if not file.is_dir(): 
            log = Activity(
                project=project,
                filename=str(file.absolute()),
                target=project.location,
            )
            queued_jobs.append(log)
            shared_logger.info(f'Phenomate: copy_data(): File was added to the queue: {file}')
        else:
            shared_logger.info(f'Phenomate: copy_data(): Path is a directory, nothing to process: {file}')
    Activity.objects.bulk_create(failed_jobs)
    Activity.objects.bulk_create(queued_jobs)
    pipeline = group(
        chain(
            copy_task.s(job.pk),
            preprocess_task.s(),
            remove_task.s(),
        )
        for job in queued_jobs
    )
    transaction.on_commit(lambda: pipeline.delay())
