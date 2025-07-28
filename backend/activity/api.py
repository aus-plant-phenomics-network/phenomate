from typing import cast

from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from ninja import Form, Router

from backend.activity.dto import ActivitySchema, OffloadActivityForm
from backend.activity.models import Activity
from backend.activity.tasks import copy_file_to_location
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
    "/{project_id}/offload",
    summary="Perform data offloading",
)
def offload_data(
    request: HttpRequest, project_id: str, form_data: Form[OffloadActivityForm]
) -> None:
    pass
    # project = get_object_or_404(Project, pk=project_id)
    # TODO: split filename to determine appropriate structure
    # copy_data(
    #     src=[Path(p) for p in form_data.src_files],
    #     dst=Path(project.location) / form_data.site,
    #     project=project,
    # )


@router.post(
    "/{activity_id}",
    summary="Restart FAILED/QUEUED job",
)
def restart_activity(request: HttpRequest, activity_id: int) -> None:
    log = get_object_or_404(Activity, pk=activity_id)
    if log.activity == Activity.ActivityChoices.COPIED:
        copy_file_to_location.delay(activity_id)  # pyright: ignore[reportFunctionMemberAccess]


@router.delete(
    "/activity/{activity_id}",
    summary="Remove an activity log",
)
def cancel_activity(request: HttpRequest, activity_id: int) -> None:
    log = get_object_or_404(Activity, pk=activity_id)
    log.delete()
