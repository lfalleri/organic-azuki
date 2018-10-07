from django.contrib import admin
from .models import Account, Adresse, PasswordRecovery


admin.site.register(Account)
admin.site.register(PasswordRecovery)
admin.site.register(Adresse)
