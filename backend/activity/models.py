from __future__ import annotations

from django.db import models

from backend.project.models import Project


# Create your models here.
class Activity(models.Model):
    class ActivityChoices(models.TextChoices):
        COPIED = "COPY"
        PREPROCESSED = "PREPROC"
        REMOVED = "REMOVE"

    class StatusChoices(models.TextChoices):
        QUEUED = "QUEUED"
        ERROR = "ERROR"
        COMPLETED = "COMPLETED"

    # Model Fields
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, blank=True, null=True, related_name="children"
    )
    activity = models.CharField(choices=ActivityChoices, default=ActivityChoices.COPIED)
    filename = models.CharField()
    target = models.CharField(default="")
    status = models.CharField(choices=StatusChoices, default=StatusChoices.QUEUED)
    error_log = models.CharField(default="")
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        name = ""
        if self.project:
            name += f"{self.project}"
        name += f"_{self.activity}_{self.filename}"
        if self.target:
            name += f"_{self.target}"
        name += f"_{self.status}"
        return name
