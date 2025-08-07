from django.http import HttpRequest
from ninja import Router

from backend.organisation.dto import OrganisationSchema
from backend.organisation.models import Organisation

router = Router()


@router.get(
    "/",
    response=list[OrganisationSchema],
    summary="List available organisations",
)
def list_organisations(request: HttpRequest) -> list[Organisation]:
    return list(Organisation.objects.all())
