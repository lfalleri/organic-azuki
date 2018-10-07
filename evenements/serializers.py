# -*- coding: utf-8 -*-
from rest_framework import serializers
from .models import Evenement


class EvenementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evenement
        fields = ('id', 'titre', 'texte', 'image', 'date', 'didascalie', 'prix')

