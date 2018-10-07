from django.contrib import admin
from .models \
    import Reference, \
           ReferencePhoto, \
           Collection, \
           Categorie, \
           MotCle, \
           TypeDePhoto, \
           Panier,\
           Article,\
           Createur, Exposition, ExpositionPhoto

admin.site.register(Reference)
admin.site.register(Article)
admin.site.register(ReferencePhoto)
admin.site.register(Collection)
admin.site.register(Panier)
admin.site.register(Categorie)
admin.site.register(MotCle)
admin.site.register(TypeDePhoto)



admin.site.register(Createur)
admin.site.register(Exposition)
admin.site.register(ExpositionPhoto)