import shutil
from pathlib import Path

from backend.project.models import Activity
from celery import shared_task


@shared_task
def copy_file_to_location(log_pk: int) -> None:
    log = Activity.objects.get(pk=log_pk)
    dst = Path(log.target)
    src = Path(log.filename)
    try:
        dst.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        log.status = "COMPLETED"
    except Exception as e:  # noqa: BLE001
        log.status = "ERROR"
        log.error_log = str(e)
    log.save()
