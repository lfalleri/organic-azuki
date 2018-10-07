# -*- coding: utf-8 -*-
from rest_framework import serializers
from .models import Createur, \
                    Exposition, \
                    ExpositionPhoto


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
