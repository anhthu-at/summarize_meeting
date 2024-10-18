from django.contrib import admin

from .models import *

# Register your models here.
admin.site.register(department)
admin.site.register(users)
admin.site.register(meeting)
admin.site.register(summarize)