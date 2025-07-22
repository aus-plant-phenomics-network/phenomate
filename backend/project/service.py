import shutil
from pathlib import Path

from backend.project.models import Activity, Project
from backend.project.tasks import copy_file_to_location

PROJECT_PATH = Path("project")


def init_project(location: Path | str) -> str:
    path = Path(location)
    path.mkdir(parents=True, exist_ok=True)
    return str(path)


def rm_project(location: str) -> None:
    shutil.rmtree(location)


def copy_data(src: list[Path], dst: Path, project: Project) -> None:
    all_items: set[Path] = set()
    failed_jobs = []
    queued_jobs = []
    for item in src:
        if not item.exists():
            log = Activity(
                project=project,
                filename=str(item.absolute()),
                target=str(dst.absolute()),
                status="ERROR",
                error_log=f"Does not exist: {item.absolute()}",
            )
            failed_jobs.append(log)
        elif item.is_file():
            all_items.add(item)
        else:
            all_items.update(set(item.rglob("*")))
    for file in all_items:
        log = Activity(
            project=project,
            filename=str(file.absolute()),
            target=str(dst.absolute()),
        )
        queued_jobs.append(log)
    Activity.objects.bulk_create(failed_jobs)
    Activity.objects.bulk_create(queued_jobs)
    for job in queued_jobs:
        copy_file_to_location.delay_on_commit(job.id)  # type: ignore[attr-defined]
