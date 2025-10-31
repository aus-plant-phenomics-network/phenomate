import datetime

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


class ProjectGetSchema(Schema):
    id: int
    location: str
    is_valid: bool
    regex: dict[str, str]


class ProjectCreateSchema(Schema):
    year: int
    summary: str
    project: str
    site: str
    platform: str
    template: str | None = None
    internal: bool = True
    researcherName: str | None = None
    organisationName: str | None = None
    root: str | None = None


class ProjectImportSchema(Schema):
    project_path: str
    metadata_path: str | None = None
