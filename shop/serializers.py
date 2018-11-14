# -*- coding: utf-8 -*-
from rest_framework import serializers
from .models \
    import Reference, \
           ReferencePhoto, \
           Collection, \
           Categorie, \
           MotCle, \
           TypeDePhoto, \
           Article, \
           Panier, \
           ModeDeLivraison,\
           CodeReduction,\
           Transaction,\
           Commande

from authentication.serializers import AccountSerializer, AdresseSerializer




class MotCleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MotCle
        fields = ('id', 'mot_cle')


class TypeDePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeDePhoto
        fields = ('id', 'type_de_photo')


class ReferencePhotoSerializer(serializers.ModelSerializer):
    type_de_photo = TypeDePhotoSerializer(read_only=False)

    class Meta:
        model = ReferencePhoto
        fields = ('id', 'type_de_photo', 'main_image')


class ReferenceSerializer(serializers.ModelSerializer):
    #mot_cles = MotCleSerializer(many=True, read_only=True)
    images = ReferencePhotoSerializer(many=True)

    class Meta:
        model = Reference
        fields = ('id',
                  'nom',
                  'description',
                  'short_description',
                  'prix',
                  'color',
                  'xxs_restants',
                  'xs_restants',
                  's_restants',
                  'm_restants',
                  'l_restants',
                  'xl_restants',
                  'xxl_restants',
                  'images',
                  #'mot_cles',
                  )

class ArticleSerializer(serializers.ModelSerializer):
    reference = ReferenceSerializer()

    class Meta:
        model = Article
        fields = ('id', 'reference', 'taille', 'quantite')


class CategorieSerializer(serializers.ModelSerializer):
    references = ReferenceSerializer(many=True)

    class Meta:
        model = Categorie
        fields = ('id', 'nom', 'references')


class CollectionSerializer(serializers.ModelSerializer):
    categories = CategorieSerializer(many=True)

    class Meta:
        model = Collection
        fields = ('id', 'nom', 'categories')


class PanierSerializer(serializers.ModelSerializer):
    articles = ArticleSerializer(many=True)

    class Meta:
        model = Panier
        fields = ('id', 'uuid', 'expiration_date', 'articles')


class ModeDeLivraisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModeDeLivraison
        fields = ('id', 'description', 'nom', 'prix', 'international')


class CodeReductionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeReduction
        fields = ('id', 'code', 'reduction')


class TransactionSerializer(serializers.ModelSerializer):
    account = AccountSerializer(read_only=False, required=False)

    class Meta:
        model = Transaction
        fields = ('id', 'account', 'montant', 'token', 'created')


class CommandeSerializer(serializers.ModelSerializer):
    account = AccountSerializer()
    transaction = TransactionSerializer()
    panier = PanierSerializer()
    adresse_livraison = AdresseSerializer(required=False)
    adresse_facturation = AdresseSerializer(required=False)
    code_reduction = CodeReductionSerializer(required=False)
    mode_de_livraison = ModeDeLivraisonSerializer(required=False)

    class Meta:
        model = Commande
        fields = ('id',
                  'account',
                  'transaction',
                  'panier',
                  'date',
                  'etat',
                  'adresse_livraison',
                  'adresse_facturation',
                  'mode_de_livraison',
                  'commentaire',
                  'code_reduction')