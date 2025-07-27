from __future__ import annotations

from typing import TYPE_CHECKING, cast

from appm import ProjectManager
from django.conf import settings
from django.shortcuts import get_object_or_404
from ninja import Form, Router

from backend.project.dto import (
    ActivitySchema,
    OffloadActivityForm,
    OrganisationSchema,
    ProjectCreateSchema,
    ProjectGetSchema,
    ProjectListSchema,
    ResearcherSchema,
)
from backend.project.models import Activity, Organisation, Personnel, Project
from backend.project.service import rm_project
from backend.project.tasks import copy_file_to_location

if TYPE_CHECKING:
    from django.http import HttpRequest

router = Router()


@router.get(
    "/",
    response=list[ProjectListSchema],
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
def get_project(request: HttpRequest, project_id: int) -> ProjectGetSchema:
    project = get_object_or_404(Project, pk=project_id)
    manager = ProjectManager.load_project(project.location)
    project_metadata = manager.metadata.model_dump(mode="python")
    return ProjectGetSchema(
        id=project.pk, location=project.location, is_valid=project.is_valid, **project_metadata
    )


@router.post("/import", response=ProjectListSchema, summary="Import a project")
def import_project(request: HttpRequest, project: str) -> Project:
    manager = ProjectManager.load_project(project)
    if not Project.objects.filter(location=manager.location).exists():
        researcherName = manager.metadata.meta.researcherName
        researcher, rstatus = (
            Personnel.objects.get_or_create(name=researcherName) if researcherName else (None, None)
        )
        organisationName = manager.metadata.meta.organisationName
        organisation, ostatus = (
            Organisation.objects.get_or_create(name=organisationName)
            if organisationName
            else (None, None)
        )
        Project.objects.create(
            year=manager.metadata.meta.year,
            summary=manager.metadata.meta.summary,
            internal=manager.metadata.meta.internal,
            researcher=researcher,
            organisation=organisation,
            location=str(manager.location),
        )
    return Project.objects.get(location=manager.location)


@router.post(
    "/",
    response=ProjectListSchema,
    summary="Create a new project",
)
def create_project(request: HttpRequest, data: ProjectCreateSchema) -> Project:
    researcher, rstatus = (
        Personnel.objects.get_or_create(name=data.researcherName)
        if data.researcherName
        else (None, None)
    )
    organisation, ostatus = (
        Organisation.objects.get_or_create(name=data.organisationName)
        if data.organisationName
        else (None, None)
    )
    root = data.root if data.root else getattr(settings, "DEFAULT_ROOT_FOLDER", "/Project")
    manager = ProjectManager.from_template(
        root=root,
        year=data.year,
        summary=data.summary,
        internal=data.internal,
        researcherName=researcher.name if researcher else None,
        organisationName=organisation.name if organisation else None,
        template=data.template,
    )
    project = Project.objects.create(
        year=data.year,
        summary=data.summary,
        internal=data.internal,
        researcher=researcher,
        organisation=organisation,
        location=str(manager.location),
    )
    manager.init_project()
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
    "/activity/{activity_id}",
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
