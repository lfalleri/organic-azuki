# -*- coding: utf-8 -*-
from rest_framework import views, status

from rest_framework.response import Response
from .models import Carte, RestaurantConfig, RestaurantReservationSlot, RestaurantReservationContact, RestaurantReservationManager
from .serializers import CarteSerializer, RestaurantConfigSerializer
import json
from datetime import datetime
import pytz


class CarteView(views.APIView):
    serializer_class = CarteSerializer

    def get(self, request, format=None):
        carte = Carte.objects.get(id=1)
        serialized_carte = CarteSerializer(carte)
        return Response(serialized_carte.data)

class RestaurantConfigView(views.APIView):
    serializer_class = RestaurantConfigSerializer

    def get(self, request, format=None):
        config = RestaurantConfig.objects.get(id=1)
        serialized_config = RestaurantConfigSerializer(config)
        return Response(serialized_config.data)


class RestaurantReservationView(views.APIView):

    def post(self, request, format=None):
        data = json.loads(request.body)
        reservation_information = data['reservation_info']
        personal_information = data['personal_info']
        config = RestaurantConfig.objects.get(id=1)
        date_format = "%Y-%m-%dT%H:%M:%S.%fZ"
        d = pytz.utc.localize(datetime.strptime(reservation_information["date"], date_format))
        d = d.replace(hour=int(reservation_information["hour"].split(':')[0]), minute=int(reservation_information["hour"].split(':')[1]))
        reservation_information["date"] = d

        reservation_slot = RestaurantReservationSlot.objects.filter(date=d)

        if not reservation_slot:
            ret, message = \
                RestaurantReservationSlot.objects.create_reservation(config,
                                                                     reservation_information,
                                                                     personal_information)
        else:
            ret, message = RestaurantReservationSlot.objects.update_reservation(config,
                                                                                reservation_slot[0],
                                                                                reservation_information,
                                                                                personal_information)

        if ret:
            return Response({'message': message}, status=status.HTTP_200_OK)
        else:
            return Response({'message': message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
