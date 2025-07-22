import datetime

from ninja import Schema

from backend.project.utils import slugify


class ResearcherSchema(Schema):
    name: str


class OrganisationSchema(Schema):
    name: str


class ProjectGetSchema(Schema):
    id: int
    name: str
    location: str
    is_valid: bool
    updated: datetime.datetime
    year: int
    internal: bool
    researcherName: str | None
    organisationName: str | None


class ProjectCreateSchema(Schema):
    year: int
    summary: str
    root: str | None = None
    internal: bool = True
    researcher: str | None = None
    organisation: str | None = None

    @property
    def name(self) -> str:
        name = f"{self.year}_{slugify(self.summary)}"
        if self.internal is not None:
            internal_val = "internal" if self.internal else "external"
            name += f"_{internal_val}"
        if self.researcher:
            name += f"_{slugify(self.researcher)}"
        if self.organisation:
            name += f"_{slugify(self.organisation)}"
        return name


class ProjectUpdateSchema(Schema):
    id: int
    year: int | None = None
    summary: str | None = None
    root: str | None = None
    internal: bool | None = None
    researcher: str | None = None
    organisation: str | None = None


class ActivitySchema(Schema):
    id: int
    activity: str
    filename: str
    target: str | None
    status: str
    error_log: str | None


class OffloadActivityForm(Schema):
    src_files: list[str]
    site: str
