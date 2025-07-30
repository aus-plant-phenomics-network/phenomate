from pathlib import Path
from typing import cast

from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from ninja import Router

from backend.activity.dto import ActivitySchema, OffloadActivityForm
from backend.activity.models import Activity
from backend.activity.service import copy_data
from backend.activity.tasks import copy_task, preprocess_task, remove_task
from backend.project.models import Project

router = Router()


@router.get(
    "/{project_id}",
    response=list[ActivitySchema],
    summary="List all activities associated with a project",
)
def list_activities(request: HttpRequest, project_id: str) -> list[Activity]:
    project = get_object_or_404(Project, pk=project_id)
    return cast("list[Activity]", project.activity_set.all())  # pyright: ignore[reportAttributeAccessIssue]


@router.post(
    "/offload/{project_id}",
    summary="Perform data offloading",
)
def offload_data(request: HttpRequest, project_id: str, form_data: OffloadActivityForm) -> None:
    project = get_object_or_404(Project, pk=project_id)
    copy_data(
        src=[Path(p) for p in form_data.src_files],
        project=project,
    )


@router.post(
    "/{activity_id}",
    summary="Restart FAILED/QUEUED job",
)
def restart_activity(request: HttpRequest, activity_id: int) -> None:
    log = get_object_or_404(Activity, pk=activity_id)
    if log.activity == Activity.ActivityChoices.COPIED:
        copy_task.delay(activity_id)  # pyright: ignore[reportFunctionMemberAccess]
    elif log.activity == Activity.ActivityChoices.PREPROCESSED:
        preprocess_task.delay(activity_id)  # pyright: ignore[reportFunctionMemberAccess]
    elif log.activity == Activity.ActivityChoices.REMOVED:
        remove_task.delay(activity_id)  # pyright: ignore[reportFunctionMemberAccess]


@router.delete(
    "/activity/{activity_id}",
    summary="Remove an activity log",
)
def cancel_activity(request: HttpRequest, activity_id: int) -> None:
    log = get_object_or_404(Activity, pk=activity_id)
    log.delete()


@router.delete("/", summary="Remove multiple activity logs")
def delete_activities(request: HttpRequest, activity_ids: list[int]) -> None:
    to_remove = set(activity_ids)
    Activity.objects.filter(pk__in=to_remove).delete()


@router.delete(
    "/project/{project_id}", summary="Remove multiple activity logs associated with a project"
)
def delete_project_activities(request: HttpRequest, project_id: int) -> None:
    project = get_object_or_404(Project, pk=project_id)
    project.activity_set.all().delete()  # pyright: ignore[reportAttributeAccessIssue]
