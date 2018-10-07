from django.contrib import admin
from .models import SendgridApiKey, StaffEmail

admin.site.register(SendgridApiKey)
admin.site.register(StaffEmail)