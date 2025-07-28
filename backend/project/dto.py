import datetime

from appm.model import ProjectMetadata
from ninja import Schema


class ProjectListSchema(Schema):
    id: int
    year: int
    summary: str
    internal: bool
    researcherName: str | None
    organisationName: str | None
    updated: datetime.datetime
    location: str
    is_valid: bool
    name: str
    root: str


class ProjectGetSchema(ProjectMetadata, Schema):
    id: int
    location: str
    is_valid: bool


class ProjectCreateSchema(Schema):
    year: int
    summary: str
    template: str
    internal: bool = True
    researcherName: str | None = None
    organisationName: str | None = None
    root: str | None = None


class ProjectImportDTO(Schema):
    project_path: str
    metadata_path: str | None = None
