from django.contrib import admin
from .models import Plat, \
                    Categorie, \
                    Specificite, \
                    Brunch, \
                    BrunchItem, \
                    Boisson, \
                    Carte, \
                    SlotOuverture, \
                    JourDeSemaine, \
                    RestaurantConfig, \
                    Fermeture, \
                    RestaurantReservationSlot, \
                    RestaurantReservationContact \

# Carte
admin.site.register(Carte)
admin.site.register(Categorie)
admin.site.register(Specificite)
admin.site.register(Plat)
admin.site.register(Brunch)
admin.site.register(BrunchItem)
admin.site.register(Boisson)

# Restaurant
admin.site.register(SlotOuverture)
admin.site.register(JourDeSemaine)
admin.site.register(RestaurantConfig)
admin.site.register(Fermeture)

admin.site.register(RestaurantReservationSlot)
admin.site.register(RestaurantReservationContact)