# -*- coding: utf-8 -*-
from django.contrib.auth import update_session_auth_hash
from rest_framework import serializers
from authentication.serializers import AccountSerializer
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
                    RestaurantReservationContact, \
                    RestaurantReservationSlot

import sys

reload(sys)
sys.setdefaultencoding('utf8')


class CategorieSerializer(serializers.ModelSerializer):

    class Meta:
        model = Categorie
        fields = ('id', 'titre')


class SpecificiteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Specificite
        fields = ('id', 'titre')


class PlatSerializer(serializers.ModelSerializer):
    categorie = CategorieSerializer(read_only=True, required=False)
    specificite = SpecificiteSerializer(read_only=True, required=False)

    class Meta:
        model = Plat
        fields = ('id', 'categorie', 'specificite', 'denomination', 'prix', 'ingredients')


class BrunchItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrunchItem
        fields = ('id', 'plat', 'est_en_option', 'prix_option')


class BrunchSerializer(serializers.ModelSerializer):
    items = BrunchItemSerializer(many=True, read_only=True)

    class Meta:
        model = Brunch
        fields = ('id', 'didascalie', 'titre', 'items', 'prix')


class BoissonSerializer(serializers.ModelSerializer):
    categorie = CategorieSerializer(read_only=True, required=False)

    class Meta:
        model = Boisson
        fields = ('id', 'nom', 'categorie', 'prix')


class CarteSerializer(serializers.ModelSerializer):

    brunchs = BrunchSerializer(many=True, read_only=True)
    plats = PlatSerializer(many=True, read_only=True)
    boissons = BoissonSerializer(many=True, read_only=True)

    class Meta:
        model = Carte
        fields = ('id', 'nom', 'brunchs', 'plats', 'boissons')


class SlotOuvertureSerializer(serializers.ModelSerializer):

    class Meta:
        model = SlotOuverture
        fields = ('id', 'from_hour', 'to_hour')


class JourDeSemaineSerializer(serializers.ModelSerializer):
    slots = SlotOuvertureSerializer(many=True, read_only=True)

    class Meta:
        model = JourDeSemaine
        fields = ('id', 'weekday', 'slots')


class FermetureSerializer(serializers.ModelSerializer):

    class Meta:
        model = Fermeture
        fields = ('id', 'debut', 'fin', 'raison')


class RestaurantConfigSerializer(serializers.ModelSerializer):
    jours = JourDeSemaineSerializer(many=True, read_only=True)
    fermetures = FermetureSerializer(many=True, read_only=True)

    class Meta:
        model = RestaurantConfig
        fields = ('id', 'nb_couverts', 'nb_couverts_par_table', 'jours', 'fermetures')


class RestaurantReservationContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantReservationContact
        fields = ('id', 'name', 'email', 'tel', 'comment')


class RestaurantReservationSlotSerializer(serializers.ModelSerializer):
    contacts = RestaurantReservationContactSerializer(many=True, read_only=True)

    class Meta:
        model = RestaurantReservationSlot
        fields = ('id', 'date', 'hour', 'nb_places_restantes', 'contacts')




class ReservationSerializer(serializers.ModelSerializer):
    pass

