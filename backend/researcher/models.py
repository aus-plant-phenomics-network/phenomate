from appm.utils import slugify
from django.db import models


# Create your models here.
class Researcher(models.Model):
    name = models.CharField(primary_key=True, max_length=100)

    def __str__(self) -> str:
        return slugify(self.name)
