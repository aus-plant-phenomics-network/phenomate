import datetime

from appm.model import ProjectMetadata
from ninja import Schema


class ResearcherSchema(Schema):
    name: str


class OrganisationSchema(Schema):
    name: str


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


class ActivitySchema(Schema):
    id: int
    activity: str
    filename: str
    target: str | None
    status: str
    error_log: str | None


class OffloadActivityForm(Schema):
    src_files: list[str]
