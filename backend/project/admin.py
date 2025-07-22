from django.contrib import admin

from backend.project.models import Activity, Organisation, Personnel, Project

# Register your models here.
admin.site.register(Project)
admin.site.register(Activity)
admin.site.register(Personnel)
admin.site.register(Organisation)
