# dto.py

from ninja import Schema
from typing import Optional


class SaveSiteInfoRequest(Schema):
    filename: str
    content: str


class SaveSiteInfoResponse(Schema):
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None