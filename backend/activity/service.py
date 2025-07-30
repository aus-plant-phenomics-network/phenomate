from pathlib import Path

from backend.activity.models import Activity
from backend.activity.tasks import copy_task
from backend.project.models import Project


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
        log = Activity(
            project=project,
            filename=str(file.absolute()),
            target=project.location,
        )
        queued_jobs.append(log)
    Activity.objects.bulk_create(failed_jobs)
    Activity.objects.bulk_create(queued_jobs)
    for job in queued_jobs:
        copy_task.delay(job.pk)  # type: ignore[attr-defined]
