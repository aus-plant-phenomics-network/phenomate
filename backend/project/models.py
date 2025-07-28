from pathlib import Path

from django.db import models

from backend.organisation.models import Organisation
from backend.researcher.models import Researcher


# Create your models here.
class Project(models.Model):
    year = models.IntegerField()
    summary = models.CharField(max_length=50)
    internal = models.BooleanField()
    researcher = models.ForeignKey(Researcher, on_delete=models.SET_NULL, null=True, blank=True)
    organisation = models.ForeignKey(Organisation, on_delete=models.SET_NULL, null=True, blank=True)
    location = models.CharField(unique=True, null=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.location

    @property
    def name(self) -> str:
        return Path(self.location).name

    @property
    def root(self) -> str:
        return str(Path(self.location).parent)

    @property
    def is_valid(self) -> bool:
        return Path(self.location).exists()

    @property
    def researcherName(self) -> str | None:
        return str(self.researcher) if self.researcher else None

    @property
    def organisationName(self) -> str | None:
        return str(self.organisation) if self.organisation else None
