from django.contrib import admin
from .models \
    import Reference,\
           ReferencePhoto, \
           Collection, \
           Categorie, \
           MotCle, \
           TypeDePhoto, \
           Panier,\
           Article,\
           ModeDeLivraison,\
           CodeReduction,\
           StripeAPiKey,\
           Transaction,\
           Commande

admin.site.register(Reference)
admin.site.register(Article)
admin.site.register(ReferencePhoto)
admin.site.register(Collection)
admin.site.register(Panier)
admin.site.register(Categorie)
admin.site.register(MotCle)
admin.site.register(TypeDePhoto)
admin.site.register(ModeDeLivraison)
admin.site.register(CodeReduction)
admin.site.register(StripeAPiKey)
admin.site.register(Transaction)
admin.site.register(Commande)

