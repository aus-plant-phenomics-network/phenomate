from __future__ import annotations

from typing import TYPE_CHECKING

from appm.exceptions import TemplateEngineException
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from ninja import NinjaAPI

from backend.activity.api import router as activity_router
from backend.organisation.api import router as organisation_router
from backend.project.api import router as project_router
from backend.researcher.api import router as researcher_router
from backend.url.api import router as urls_router
from backend.logs.api import router as logs_router

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


@app.exception_handler(TemplateEngineException)
def invalid_template(request: HttpRequest, exc: TemplateEngineException) -> HttpResponse:
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


app.add_router("/project/", project_router, tags=["project"])
app.add_router("/urls/", urls_router, tags=["urls"])
app.add_router("/researcher/", researcher_router, tags=["researcher"])
app.add_router("/organisation/", organisation_router, tags=["organisation"])
app.add_router("/activity/", activity_router, tags=["activity"])
app.add_router("/logs/", logs_router, tags=["logs"])
