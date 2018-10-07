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
           Createur, \
           Exposition, \
           ExpositionPhoto

from authentication.serializers import AccountSerializer




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
    account = AccountSerializer()

    class Meta:
        model = Panier
        fields = ('id', 'uuid', 'expiration_date', 'account', 'articles')


class CreateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Createur
        fields = ('id', 'nom', 'texte', 'image')


class ExpositionPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpositionPhoto
        fields = ('id', 'photo', 'legende')


class ExpositionSerializer(serializers.ModelSerializer):
    photos = ExpositionPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Exposition
        fields = ('id', 'titre', 'artiste', 'photo_artiste', 'texte', 'didascalie', 'photos', 'en_cours')
