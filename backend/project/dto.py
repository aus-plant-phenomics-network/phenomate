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


class ProjectPreviewSchema(Schema):
    year: int | None = None
    summary: str | None = None
    project: str | None = None
    site: str | None = None
    platform: str | None = None
    root: str | None = None
    internal: bool
    template: str | None
    researcherName: str | None
    organisationName: str | None



class ProjectGetSchema(Schema):
    id: int
    location: str
    is_valid: bool
    regex: dict[str, str]


class ProjectCreateSchema(Schema):
    root: str | None = None
    year: int
    summary: str
    platform: str
    project: str
    site: str
    internal: bool = True
    researcherName: str | None = None
    organisationName: str | None = None
    template: str | None = None
    


class ProjectImportSchema(Schema):
    project_path: str
    metadata_path: str | None = None
