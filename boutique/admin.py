from django.contrib import admin
from .models import Createur, Exposition, ExpositionPhoto

admin.site.register(Createur)
admin.site.register(Exposition)
admin.site.register(ExpositionPhoto)