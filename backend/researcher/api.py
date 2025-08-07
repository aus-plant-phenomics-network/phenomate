from django.http import HttpRequest
from ninja import Router

from backend.researcher.dto import ResearcherSchema
from backend.researcher.models import Researcher

router = Router()


@router.get(
    "/",
    response=list[ResearcherSchema],
    summary="List available researchers",
)
def list_researchers(request: HttpRequest) -> list[Researcher]:
    return list(Researcher.objects.all())
