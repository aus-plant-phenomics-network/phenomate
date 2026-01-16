from __future__ import annotations

from typing import TYPE_CHECKING

from appm import ProjectManager
from django.conf import settings
from django.shortcuts import get_object_or_404
from ninja import Router
from pydantic import ValidationError
import re

from backend.organisation.models import Organisation
from backend.project.dto import (
    ProjectCreateSchema,
    ProjectGetSchema,
    ProjectImportSchema,
    ProjectListSchema,
    ProjectPreviewSchema
)
from backend.project.models import Project
# from backend.project.service import rm_project
from backend.researcher.models import Researcher

if TYPE_CHECKING:
    from django.http import HttpRequest

router = Router()


from appm.utils import get_task_logger

shared_logger = get_task_logger(__name__)
# shared_logger = get_logger('django')


@router.get(
    "/",
    response=list[ProjectListSchema],
    summary="List available projects",
)
def list_projects(request: HttpRequest) -> list[Project]:
    return list(Project.objects.all())


@router.get(
    "/id/{project_id}",
    response=ProjectGetSchema,
    summary="Get project by PK",
)
def get_project(request: HttpRequest, project_id: int) -> ProjectGetSchema:
    project = get_object_or_404(Project, pk=project_id)
    shared_logger.info(f'Phenomate: get_project(): project.location : {project.location}')
    manager = ProjectManager.load_project(project.location)
    shared_logger.info(f'Phenomate: get_project(): manager.root : {manager.root}')
    regex = {name: ext.js_regex for name, ext in manager.metadata.file.items()}
    return ProjectGetSchema(
        id=project.pk, location=project.location, is_valid=project.is_valid, regex=regex
    )


@router.post(
    "/",
    response=ProjectListSchema,
    summary="Create a new project",
)
def create_project(request: HttpRequest, data: ProjectCreateSchema) -> Project:
    researcher, rstatus = (
        Researcher.objects.get_or_create(name=data.researcherName)
        if data.researcherName
        else (None, None)
    )
    organisation, ostatus = (
        Organisation.objects.get_or_create(name=data.organisationName)
        if data.organisationName
        else (None, None)
    )
    root = data.root if data.root else getattr(settings, "DEFAULT_ROOT_FOLDER", "/Project")
    shared_logger.info(f'Phenomate: create_project(): root : {root}')
    manager = ProjectManager.from_template(
        root=root,
        year=data.year,
        summary=data.summary,
        project=data.project,
        site=data.site,
        platform=data.platform,
        internal=data.internal,
        researcherName=researcher.name if researcher else None,
        organisationName=organisation.name if organisation else None,
        template=data.template,
    )
    project = Project.objects.create(
        year=data.year,
        summary=data.summary,
        project=data.project,
        site=data.site,
        platform=data.platform,
        internal=data.internal,
        researcher=researcher,
        organisation=organisation,
        location=str(manager.location.absolute()),
    )
    manager.init_project()
    return project


@router.post("/load", response=ProjectListSchema)
def load_project(request: HttpRequest, data: ProjectImportSchema) -> Project:
    manager = ProjectManager.load_project(data.project_path, data.metadata_path)
    shared_logger.info(f'Phenomate: load_project(): manager.root : {manager.root}')
    if not Project.objects.filter(location=manager.location).exists():
        researcherName = manager.metadata.meta.researcherName
        researcher, rstatus = (
            Researcher.objects.get_or_create(name=researcherName)
            if researcherName
            else (None, None)
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
            location=str(manager.location.absolute()),
        )
    return Project.objects.get(location=str(manager.location.absolute()))


@router.delete(
    "/{project_id}",
    summary="Remove a project",
)
def delete_project(request: HttpRequest, project_id: int) -> None:
    p = get_object_or_404(Project, pk=project_id)
    shared_logger.info(f'Phenomate: delete_project(): project : {p}')
    # Remove stored folder
    #if p.is_valid:
    #    rm_project(p.location)
    p.delete()


@router.delete("/", summary="Remove multiple projects")
def delete_projects(request: HttpRequest, project_ids: list[int]) -> None:
    to_remove = set(project_ids)
    projects = [get_object_or_404(Project, pk=project_id) for project_id in project_ids]
    shared_logger.info(f'Phenomate: delete_projects(): about to delete a number of projects: {len(projects)}')
    #for project in projects:
    #    if project.is_valid:
    #        rm_project(project.location)
    Project.objects.filter(pk__in=to_remove).delete()




@router.post(
    "/preview/",
    response=str,
    summary="Generate project location preview",
)
def preview_project(request: HttpRequest, payload: ProjectPreviewSchema) -> str:
    """Generate a preview of the project location based on input parameters."""
    # Create a temporary ProjectManager instance with the input data
    # Adjust this based on how your ProjectManager (pm) is instantiated
    # pm = None
    try:
        pm = ProjectManager.from_template(
            root=payload.root,
            year=payload.year,
            summary=payload.summary,
            platform=payload.platform,
            project=payload.project,
            site=payload.site,
            internal=payload.internal,            
            researcherName=payload.researcherName,
            organisationName=payload.organisationName,
            template=payload.template,
        )
    except ValidationError as e:
        shared_logger.debug(f'Phenomate: preview_project(): Error creating ProjectManager: {e}')
        match = re.search(r'invalid field:\s*(.*?)\s*Structure', str(e), re.IGNORECASE)
        invalidfieldstr = ''
        if match:
            invalidfieldstr = match.group(1)          
            if invalidfieldstr.endswith('.'):
                invalidfieldstr = invalidfieldstr[:-1]

        errorstr = f'Invalid input in naming_convention of template file: \'{invalidfieldstr}\'. \nTemplate file: {payload.template}. Please choose from the following list [\'year\', \'site\', \'researcherName\', \'platform\', \'internal\', \'summary\', \'project\', \'organisationName\']. Options are case sensitive.'
        pm = None
    except Exception as e:
        shared_logger.debug(f'Phenomate: preview_project(): Error creating ProjectManager: {e}')
        errorstr = f'{e}'
        pm = None
    
    if pm is None:
        return f'{errorstr} Failed to return project preview directory. | Exists: False'
    # Return the location string

    Path_exists = 'False'
    if pm.location.exists() :
        Path_exists = 'True'


    return str(pm.location) + ' | Exists: ' + Path_exists
