from __future__ import annotations

from typing import TYPE_CHECKING

from ninja import Router

from backend.url.dto import DirFileItem
from backend.url.service import list_dir

if TYPE_CHECKING:
    from django.http import HttpRequest

router = Router()


@router.get("/", response=list[DirFileItem])
def get_children_url(
    request: HttpRequest,
    src: str = "/",
    dirOnly: bool = False,
) -> list[DirFileItem]:
    return list_dir(src, dirOnly)
