from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING, cast

from django.conf import settings
from django.shortcuts import get_object_or_404
from ninja import Form, Router

from backend.project.dto import (
    ActivitySchema,
    OffloadActivityForm,
    OrganisationSchema,
    ProjectCreateSchema,
    ProjectGetSchema,
    ResearcherSchema,
)
from backend.project.models import Activity, Organisation, Personnel, Project
from backend.project.service import copy_data, init_project, rm_project
from backend.project.tasks import copy_file_to_location

if TYPE_CHECKING:
    from django.http import HttpRequest

router = Router()


@router.get(
    "/",
    response=list[ProjectGetSchema],
    summary="List available projects",
)
def list_projects(request: HttpRequest) -> list[Project]:
    return list(Project.objects.all())


@router.get(
    "/researchers",
    response=list[ResearcherSchema],
    summary="List available researchers",
)
def list_researchers(request: HttpRequest) -> list[Personnel]:
    return list(Personnel.objects.all())


@router.get(
    "/organisations",
    response=list[OrganisationSchema],
    summary="List available organisations",
)
def list_organisations(request: HttpRequest) -> list[Organisation]:
    return list(Organisation.objects.all())


@router.get(
    "/{project_id}",
    response=ProjectGetSchema,
    summary="Get project by PK",
)
def get_project(request: HttpRequest, project_id: int) -> Project:
    return get_object_or_404(Project, pk=project_id)


@router.post(
    "/",
    response=ProjectGetSchema,
    summary="Create a new project",
)
def create_project(request: HttpRequest, data: ProjectCreateSchema) -> Project:
    researcher, rstatus = (
        Personnel.objects.get_or_create(name=data.researcher) if data.researcher else (None, None)
    )
    organisation, ostatus = (
        Organisation.objects.get_or_create(name=data.organisation)
        if data.organisation
        else (None, None)
    )

    project = Project.objects.create(
        year=data.year,
        summary=data.summary,
        root=data.root if data.root else getattr(settings, "DEFAULT_ROOT_FOLDER", "/Project"),
        internal=data.internal,
        researcher=researcher,
        organisation=organisation,
        name=data.name,
    )
    init_project(project.location)
    return project


@router.delete(
    "/{project_id}",
    summary="Remove a project",
)
def delete_project(request: HttpRequest, project_id: int) -> None:
    p = get_object_or_404(Project, pk=project_id)
    # Remove stored folder
    if p.is_valid:
        rm_project(p.location)
    p.delete()


@router.delete("/", summary="Remove multiple projects")
def delete_projects(request: HttpRequest, project_ids: list[int]) -> None:
    to_remove = set(project_ids)
    projects = [get_object_or_404(Project, pk=project_id) for project_id in project_ids]
    for project in projects:
        if project.is_valid:
            rm_project(project.location)
    Project.objects.filter(pk__in=to_remove).delete()


@router.get(
    "/{project_id}/activity",
    response=list[ActivitySchema],
    summary="List all activities associated with a project",
)
def list_activities(request: HttpRequest, project_id: str) -> list[Activity]:
    project = get_object_or_404(Project, pk=project_id)
    return cast("list[Activity]", project.activity_set.all())


@router.post(
    "/{project_id}/offload",
    summary="Perform data offloading",
)
def offload_data(
    request: HttpRequest, project_id: str, form_data: Form[OffloadActivityForm]
) -> None:
    project = get_object_or_404(Project, pk=project_id)
    copy_data(
        src=[Path(p) for p in form_data.src_files],
        dst=Path(project.location) / form_data.site,
        project=project,
    )


@router.post(
    "/activity/{activity_id}",
    summary="Restart FAILED/QUEUED job",
)
def restart_activity(request: HttpRequest, activity_id: int) -> None:
    log = get_object_or_404(Activity, pk=activity_id)
    if log.activity == Activity.ActivityChoices.COPIED:
        copy_file_to_location.delay(activity_id)


@router.delete(
    "/activity/{activity_id}",
    summary="Remove an activity log",
)
def cancel_activity(request: HttpRequest, activity_id: int) -> None:
    log = get_object_or_404(Activity, pk=activity_id)
    log.delete()
