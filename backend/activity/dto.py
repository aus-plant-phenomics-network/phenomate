from ninja import Schema


class ActivitySchema(Schema):
    id: int
    activity: str
    filename: str
    target: str | None
    status: str
    error_log: str | None


class OffloadActivityForm(Schema):
    src_files: list[str]
