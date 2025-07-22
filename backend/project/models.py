from fileinput import filename
from pathlib import Path

from django.db import models

from backend.project.utils import slugify


class Personnel(models.Model):
    name = models.CharField(primary_key=True, max_length=100)

    def __str__(self) -> str:
        return slugify(self.name)


class Organisation(models.Model):
    name = models.CharField(primary_key=True, max_length=100)

    def __str__(self) -> str:
        return slugify(self.name)


# Create your models here.
class Project(models.Model):
    name = models.CharField(unique=True, null=False)
    year = models.IntegerField()
    summary = models.CharField(max_length=50)
    root = models.CharField()
    internal = models.BooleanField()
    researcher = models.ForeignKey(Personnel, on_delete=models.SET_NULL, null=True, blank=True)
    organisation = models.ForeignKey(Organisation, on_delete=models.SET_NULL, null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name

    @property
    def location(self) -> str:
        return str(Path(self.root) / self.name)

    @property
    def is_valid(self) -> bool:
        return Path(self.location).exists()

    @property
    def researcherName(self) -> str | None:
        return str(self.researcher) if self.researcher else None

    @property
    def organisationName(self) -> str | None:
        return str(self.organisation) if self.organisation else None


class Activity(models.Model):
    class ActivityChoices(models.TextChoices):
        COPIED = "CP"
        REMOVED = "RM"

    class StatusChoices(models.TextChoices):
        QUEUED = "QUEUED"
        ERROR = "ERROR"
        COMPLETED = "COMPLETED"

    # Model Fields
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    activity = models.CharField(
        max_length=2, choices=ActivityChoices, default=ActivityChoices.COPIED
    )
    filename = models.CharField()
    target = models.CharField(default="")
    status = models.CharField(choices=StatusChoices, default=StatusChoices.QUEUED)
    error_log = models.CharField(default="")

    def __str__(self) -> str:
        name = ""
        if self.project:
            name += f"{self.project}"
        name += f"_{self.activity}_{filename}"
        if self.target:
            name += f"_{self.target}"
        name += f"_{self.status}"
        return name
