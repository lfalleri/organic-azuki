# -*- coding: utf-8 -*-
from rest_framework import views, status

from rest_framework.response import Response
from .models import Createur, Exposition, ExpositionPhoto
from .serializers import CreateurSerializer, ExpositionPhotoSerializer, ExpositionSerializer
import json
from datetime import datetime
import pytz


class CreateurView(views.APIView):
    serializer_class = CreateurSerializer

    def get(self, request, format=None):
        createurs = Createur.objects.all()
        serialized_createur = CreateurSerializer(createurs, many=True)
        return Response(serialized_createur.data)


class ExpositionView(views.APIView):
    #serializer_class = ExpositionSerializer

    def get(self, request, format=None):
        expo = Exposition.objects.all()
        serialized_expo = ExpositionSerializer(expo, many=True)
        return Response(serialized_expo.data)
