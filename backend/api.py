from __future__ import annotations

from typing import TYPE_CHECKING

from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from ninja import NinjaAPI

from backend.project.api import router as project_router
from backend.url.api import router as urls_router

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse

app = NinjaAPI(title="Phenomate API")


# Error handling logic
@app.exception_handler(ValueError)
def invalid_request(request: HttpRequest, exc: ValueError) -> HttpResponse:
    return app.create_response(
        request,
        {"message": str(exc)},
        status=400,
    )


@app.exception_handler(ObjectDoesNotExist)
def does_not_exist(request: HttpRequest, exc: ObjectDoesNotExist) -> HttpResponse:
    return app.create_response(
        request,
        {"message": str(exc)},
        status=404,
    )


@app.exception_handler(IntegrityError)
def integrity_conflict(request: HttpRequest, exc: IndentationError) -> HttpResponse:
    return app.create_response(
        request,
        {"message": str(exc)},
        status=409,
    )


app.add_router("/project", project_router, tags=["Project"])
app.add_router("/urls", urls_router, tags=["urls"])
