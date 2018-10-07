# -*- coding: utf-8 -*-
import json
from rest_framework import permissions, views, status, viewsets, generics
from rest_framework.response import Response
from .models import Lesson,\
                    Reservation,\
                    Professeur, \
                    Transaction, \
                    Formule,\
                    CodeReduction

from authentication.models import Account

from .serializers import LessonSerializer, \
                         ReservationSerializer, \
                         ProfesseurSerializer, \
                         TransactionSerializer,\
                         FormuleSerializer,\
                         CodeReductionSerializer

import stripe
from datetime import datetime
import pytz


class CalendarView(views.APIView):
    serializer_class = LessonSerializer

    def post(self, request, format=None):
        queryset = Lesson.objects.all()


class LessonView(views.APIView):
    serializer_class = LessonSerializer

    def get(self, request, format=None):
        if 'lesson_id' not in request.query_params.keys():
            queryset = Lesson.objects.all()
        else:
            lesson_id = request.query_params['lesson_id']
            lesson = Lesson.objects.get(id=lesson_id)
            if not lesson:
                return Response(status=status.HTTP_404_NOT_FOUND)
            queryset = [lesson]

        fmt = '%Y-%m-%d %H:%M:%S'
        now = datetime.utcnow().replace(tzinfo=pytz.utc)
        dnow = datetime.strptime(now.strftime(fmt), fmt)

        for i,_ in enumerate(queryset):
            pending_reservations = Reservation.objects.filter(lesson=queryset[i], confirmed=False)
            if pending_reservations:
                for pending_reservation in pending_reservations:
                    d2 = datetime.strptime(pending_reservation.created.strftime(fmt), fmt)
                    diff = (dnow - d2)
                    diff_min, diff_sec = divmod(diff.days * 86400 + diff.seconds, 60)
                    if diff_min >= 15:
                        pending_reservation.delete()
                    else:
                        queryset[i].nb_places -= pending_reservation.nb_personnes

        new_queryset = queryset[:]
        serialized = LessonSerializer(new_queryset, many=True)
        return Response(serialized.data)


class ReservationView(views.APIView):
    serializer_class = ReservationSerializer

    def post(self, request, format=None):
        data = json.loads(request.body)
        account_id = data['account']['id']
        lesson_id = data['lesson']['id']

        # Get objects account and event
        lesson = Lesson.objects.get(id=lesson_id)
        account = Account.objects.get(id=account_id)

        credit = 0
        debit = 0

        if 'present' in data.keys():
            reservation = Reservation.objects.filter(account=account, lesson=lesson, confirmed=True)
            reservation = reservation[0]
            reservation.checked_present = data['present']
            if reservation.checked_present:
                reservation.nb_present = reservation.nb_personnes
            reservation.save()
            serialized = ReservationSerializer(reservation)
            return Response(serialized.data)

        if 'nb_present' in data.keys():
            reservation = Reservation.objects.filter(account=account, lesson=lesson, confirmed=True)
            reservation = reservation[0]
            reservation.nb_present = data['nb_present']
            if reservation.nb_present == reservation.nb_personnes:
                reservation.checked_present = True
            reservation.save()
            serialized = ReservationSerializer(reservation)
            return Response(serialized.data)

        nb_persons = data['nb_persons']
        if lesson.nb_places < nb_persons:
            return Response({
                'status': 'Unauthorized',
                'message': 'Nombre de places insuffisant pour réserver ce cours'
            }, status=status.HTTP_401_UNAUTHORIZED)

        if 'credit' in data.keys() and 'debit' in data.keys():
            # Live reservation
            credit = int(data['credit'])
            debit = int(data['debit'])

        if account is not None:
            if account.is_active:
                if (account.credits + credit) < (lesson.price * nb_persons):
                    return Response({
                        'status': 'Unauthorized',
                        'message': 'Not enough credits for this account'
                    }, status=status.HTTP_401_UNAUTHORIZED)

                reservation = Reservation.objects.create_reservation(lesson, account, nb_persons, True)
                serialized = ReservationSerializer(reservation)

                # Update account and lesson
                account.credits += credit - (lesson.price * nb_persons)
                account.save()
                lesson.nb_places -= nb_persons
                lesson.save()
                return Response(serialized.data)
            else:
                return Response({
                    'status': 'Unauthorized',
                    'message': 'This account has been disabled.'
                }, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({
                'status': 'Unauthorized',
                'message': 'Username/password combination invalid.'
            }, status=status.HTTP_401_UNAUTHORIZED)

    def delete(self, request, format=None):
        account_id = request.query_params['account_id']
        account = Account.objects.get(id=account_id)
        lesson_id = request.query_params['lesson_id']
        lesson = Lesson.objects.get(id=lesson_id)

        reservation = Reservation.objects.filter(account=account, lesson=lesson, confirmed=True)
        if not reservation:
            return Response(status=status.HTTP_404_NOT_FOUND)
        reservation = reservation[0]

        #Update account and lesson
        account.credits += lesson.price * reservation.nb_personnes
        account.save()
        lesson.nb_places += reservation.nb_personnes
        lesson.save()

        reservation.delete()
        return Response(status=status.HTTP_200_OK)

    def get(self, request, format=None):
        account = None
        lesson = None
        reservations = []

        if 'account_id' in request.query_params.keys():
            account_id = request.query_params['account_id']
            account = Account.objects.get(id=account_id)
            if not account:
               return Response(status=status.HTTP_404_NOT_FOUND)

        if 'lesson_id' in request.query_params.keys():
            lesson_id = request.query_params['lesson_id']
            lesson = Lesson.objects.get(id=lesson_id)
            if not lesson:
                return Response(status=status.HTTP_404_NOT_FOUND)

        if lesson and account:
            reservations = Reservation.objects.filter(account=account, lesson=lesson, confirmed=True)
            if not reservations:
                return Response(status=status.HTTP_404_NOT_FOUND)
        elif lesson and not account:
            reservations = Reservation.objects.filter(lesson=lesson, confirmed=True)
        elif not lesson and account:
            reservations = Reservation.objects.filter(account=account, confirmed=True)

        serialized = ReservationSerializer(reservations, many=True)
        return Response(serialized.data)


class PendingReservationView(views.APIView):

    def post(self, request, format=None):
        data = json.loads(request.body)
        lesson_id = data['lesson']['id']
        account_id = data['account']['id']
        nb_places = data['nb_pending_reservations']

        lesson = Lesson.objects.get(id=lesson_id)
        if not lesson:
            return Response({
                'status': 'Unauthorized',
                'message': "Le cours n'a pu être trouvé"
            }, status=status.HTTP_404_NOT_FOUND)

        account = Account.objects.get(id=account_id)
        if not account:
            return Response({
                'status': 'Unauthorized',
                'message': "Utilisateur non trouvé"
            }, status=status.HTTP_404_NOT_FOUND)

        if nb_places > lesson.nb_places:
            return Response({
                'status': 'Unauthorized',
                'message': "Plus assez de places restantes"
            }, status=status.HTTP_401_UNAUTHORIZED)

        pending_reservation = Reservation.objects.filter(lesson=lesson, account=account, confirmed=False)
        if not pending_reservation:
            pending_reservation = Reservation.objects.create_reservation(lesson, account, nb_places, False)
        else:
            pending_reservation = pending_reservation[0]
            pending_reservation.nb_personnes += nb_places
            if pending_reservation.nb_personnes > lesson.nb_places:
                return Response({
                    'status': 'Unauthorized',
                    'message': "Plus assez de places restantes"
                }, status=status.HTTP_401_UNAUTHORIZED)
            pending_reservation.save()
        serialized = ReservationSerializer(pending_reservation)
        return Response(serialized.data)

    def delete(self, request, format=None):
        lesson_id = request.query_params['lesson_id']
        lesson = Lesson.objects.get(id=lesson_id)
        account_id = request.query_params['account_id']
        account = Account.objects.get(id=account_id)

        nb_places = int(request.query_params['nb_pending_reservations'])
        pending_reservation = Reservation.objects.filter(lesson=lesson, account=account, confirmed=False)
        if not pending_reservation:
            return Response(status=status.HTTP_404_NOT_FOUND)

        pending_reservation = pending_reservation[0]
        pending_reservation.delete()
        return Response(status=status.HTTP_200_OK)

    def get(self, request, format=None):
        account = None
        lesson = None
        reservations = []

        if 'account_id' in request.query_params.keys():
            account_id = request.query_params['account_id']
            account = Account.objects.get(id=account_id)
            if not account:
               return Response(status=status.HTTP_404_NOT_FOUND)

        if 'lesson_id' in request.query_params.keys():
            lesson_id = request.query_params['lesson_id']
            lesson = Lesson.objects.get(id=lesson_id)
            if not lesson:
                return Response(status=status.HTTP_404_NOT_FOUND)

        if lesson and account:
            reservations = Reservation.objects.filter(account=account, lesson=lesson, confirmed=False)
            if not reservations:
                return Response(status=status.HTTP_404_NOT_FOUND)
        elif lesson and not account:
            reservations = Reservation.objects.filter(lesson=lesson, confirmed=False)
        elif not lesson and account:
            reservations = Reservation.objects.filter(account=account, confirmed=False)

        serialized = ReservationSerializer(reservations, many=True)
        return Response(serialized.data)


class ProfesseursView(views.APIView):
    def get(self, request, format=None):
        queryset = Professeur.objects.all()
        serialized = ProfesseurSerializer(queryset, many=True)
        return Response(serialized.data)



class FormuleView(views.APIView):

    def get(self, request, format=None):
        queryset = Formule.objects.all()
        serialized = FormuleSerializer(queryset, many=True)
        return Response(serialized.data)


class CodeReductionView(views.APIView):

    def post(self, request, format=None):
        data = json.loads(request.body)
        code = data['code']

        code_reduction = CodeReduction.objects.filter(code=code)
        if code_reduction:
            code_reduction = code_reduction[0]
            serialized = CodeReductionSerializer(code_reduction)
            return Response(serialized.data)
        else:
            return Response({
                'status': 'Unauthorized',
                'message': "Code de réduction non valide"
            }, status=status.HTTP_404_NOT_FOUND)


class TransactionView(views.APIView):

    def get(self, request, format=None):
        account = None
        transactions = []

        if 'account_id' in request.query_params.keys():
            account_id = request.query_params['account_id']
            account = Account.objects.get(id=account_id)
        if not account:
            return Response(status=status.HTTP_404_NOT_FOUND)

        transactions = Transaction.objects.filter(account=account)
        serialized = TransactionSerializer(transactions, many=True)
        return Response(serialized.data)

    def post(self, request, format=None):
        data = json.loads(request.body)
        account_id = data['account_id']
        montant = data['montant']
        token = data['token']

        stripe.api_key = "sk_test_ZgA3fIz8UXgmhZpwXg8Aej5V"

        account = Account.objects.get(id=account_id)
        if not account:
            return Response({
                'status': 'Unauthorized',
                'message': "Utilisateur non trouvé"
            }, status=status.HTTP_404_NOT_FOUND)

        try:
           # Charge the user's card:
           charge = stripe.Charge.create(
              amount=montant*100,
              currency="eur",
              description=account.first_name+ " "+ account.last_name,
              source=token,
           )
        except Exception as inst:
           return Response({
               'status': 'Unauthorized',
               'message': "La transaction a échoué"
           }, status=status.HTTP_401_UNAUTHORIZED)

        transaction = Transaction.objects.create_transaction(account, montant, token)
        transaction.save()

        account.credits += int(montant)
        account.save()

        serialized = TransactionSerializer(transaction)
        return Response(serialized.data)
