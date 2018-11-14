from django.contrib import admin
from .models \
    import ReferenceAdulte, \
           ReferenceEnfant, \
           ReferenceTailleUnique, \
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

admin.site.register(ReferenceAdulte)
admin.site.register(ReferenceEnfant)
admin.site.register(ReferenceTailleUnique)
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

