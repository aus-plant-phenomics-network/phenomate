import datetime

from ninja import Schema

from backend.activity.models import Activity


class ActivitySchema(Schema):
    id: int
    activity: Activity.ActivityChoices
    filename: str
    target: str | None
    status: Activity.StatusChoices
    error_log: str | None
    created: datetime.datetime
    updated: datetime.datetime


class OffloadActivityForm(Schema):
    src_files: list[str]
