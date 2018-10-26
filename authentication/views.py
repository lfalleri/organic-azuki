import json
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from rest_framework import permissions, viewsets, status, views
from rest_framework.response import Response
from authentication.models import Account,\
                                  AccountManager, \
                                  Adresse,\
                                  AdresseManager, \
                                  PasswordRecovery,\
                                  PasswordRecoveryManager
from authentication.permissions import IsAccountOwner
from authentication.serializers import AccountSerializer, \
                                       FullAccountSerializer,\
                                       PasswordRecoverySerializer, \
                                       AdresseSerializer\

import os
import uuid
import datetime

class AccountViewSet(viewsets.ModelViewSet):
    lookup_field = 'username'
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return (permissions.AllowAny(),)

        if self.request.method == 'POST':
            return (permissions.AllowAny(),)

        return (permissions.IsAuthenticated(), IsAccountOwner(),)

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            Account.objects.create_user(**serializer.validated_data)
            return Response(serializer.validated_data, status=status.HTTP_201_CREATED)

        return Response({
            'status': 'Bad request',
            'message': 'Account could not be created with received data.'
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    def post(self, request, format=None):
        data = json.loads(request.body)
        email = data.get('email', None)
        password = data.get('password', None)

        account = authenticate(email=email, password=password)


        if account is not None:
            if account.is_active:
                login(request, account)
                serialized = AccountSerializer(account)

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


class LogoutView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        logout(request)
        return Response({}, status=status.HTTP_204_NO_CONTENT)


class FullAccountView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        data = json.loads(request.body)
        email = data.get('email', None)
        account = Account.objects.get(email=email)
        if account is not None:
            serialized = FullAccountSerializer(account)
            return Response(serialized.data)
        else:
            return Response({
                'status': 'Not Found',
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AccountView(views.APIView):
    def update_password(self, request, account, data):
        old_password = data['old_password']
        password = data['password']

        if not account.check_password(old_password):
            return Response({
                'status': 'Unauthorized',
                'message': 'Ancien mot de passe invalide'
            }, status=status.HTTP_401_UNAUTHORIZED)

        logout(request)
        first_name = data['first_name']
        last_name = data['last_name']
        email = data['email']

        account.first_name = first_name
        account.last_name = last_name
        account.email = AccountManager.normalize_email(email)

        account.set_password(password)
        account.save()
        authentification = authenticate(email=email, password=password)
        if authentification is not None:
            if authentification.is_active:
                login(request, authentification)
        return Response(status.HTTP_200_OK)

    def post(self, request, format=None):
        data = json.loads(request.body)
        account_id = data['account_id']
        account = Account.objects.get(id=account_id)
        if not account:
            return Response({
                'status': 'Not Found',
                'message': 'This account has not been found.'
            }, status=status.HTTP_404_NOT_FOUND)

        if "credit" in data:
            # Just recrediting account
            credit = int(data['credit'])
            account.credits += credit
            account.save()
            return Response(status.HTTP_200_OK)

        old_password = data['old_password']
        password = data['password']
        if old_password != '' or password != '':
            return self.update_password(request, account, data)

        first_name = data['first_name']
        last_name = data['last_name']
        email = data['email']

        account.first_name = first_name
        account.last_name = last_name
        account.email = AccountManager.normalize_email(email)
        account.save()
        return Response(status.HTTP_200_OK)

    def get(self, request, format=None):
        first_name = None
        last_name = None
        email = None
        exact = None
        queryset = []

        if 'first_name' in request.query_params.keys():
            first_name = request.query_params['first_name']
        if 'last_name' in request.query_params.keys():
            last_name = request.query_params['last_name']
        if 'email' in request.query_params.keys():
            email = request.query_params['email']
        if 'exact' in request.query_params.keys():
            exact = request.query_params['exact']

        if last_name:
            if first_name:
                if email:
                    queryset = Account.objects.filter(last_name__iexact=last_name, first_name__iexact=first_name,email__iexact=email)
                else:
                    queryset = Account.objects.filter(last_name__iexact=last_name, first_name__iexact=first_name)
            else:
                if email:
                    queryset = Account.objects.filter(last_name__iexact=last_name, email__iexact=email)
                else:
                    queryset = Account.objects.filter(last_name__iexact=last_name)
        else:
            if email:
                if first_name:
                    queryset = Account.objects.filter(email__iexact=email, first_name__iexact=first_name)
                else:
                    queryset = Account.objects.filter(email__iexact=email)
            elif first_name:
                queryset = Account.objects.filter(first_name__iexact=first_name)
            else:
                queryset = Account.objects.all()

        if not exact and not queryset:
            if last_name:
                if first_name:
                    if email:
                        queryset = Account.objects.filter(last_name__icontains=last_name, first_name__icontains=first_name,
                                                          email__iexact=email)
                    else:
                        queryset = Account.objects.filter(last_name__icontains=last_name, first_name__icontains=first_name)
                else:
                    if email:
                        queryset = Account.objects.filter(last_name__icontains=last_name, email__icontains=email)
                    else:
                        queryset = Account.objects.filter(last_name__icontains=last_name)
            else:
                if email:
                    if first_name:
                        queryset = Account.objects.filter(email__icontains=email, first_name__icontains=first_name)
                    else:
                        queryset = Account.objects.filter(email__icontains=email)
                elif first_name:
                    queryset = Account.objects.filter(first_name__icontains=first_name)
                else:
                    queryset = Account.objects.all()

        serialized = AccountSerializer(queryset, many=True)
        return Response(serialized.data)

    def delete(self, request, format=None):
        account_id = request.query_params['account_id']
        account = Account.objects.get(id=account_id)
        if not account:
            return Response({
                'status': 'Not Found',
                'message': 'This account has not been found.'
            }, status=status.HTTP_404_NOT_FOUND)

        password = request.query_params['password']
        if not account.check_password(password):
            return Response({
                'status': 'Unauthorized',
                'message': 'Mot de passe invalide'
            }, status=status.HTTP_401_UNAUTHORIZED)

        account.delete()
        return Response({}, status=status.HTTP_200_OK)


class CheckPasswordView(views.APIView):
    def post(self, request, format=None):

        data = json.loads(request.body)

        account_id = data['account_id']
        account = Account.objects.get(id=account_id)

        password = data['password']
        print("CheckPasswordView : password  %s" % password)
        if not account.check_password(password):
            return Response({
                'status': 'Unauthorized',
                'message': 'Mot de passe invalide'
            }, status=status.HTTP_401_UNAUTHORIZED)

        return Response({}, status=status.HTTP_200_OK)


class PasswordRecoveryView(views.APIView):

    def get(self, request, format=None):
        token = request.query_params['token']
        password_recovery = PasswordRecovery.objects.filter(token=token)
        if not password_recovery:
            return Response({
                'status': 'Not Found',
                'message': 'Invalid token'
            }, status=status.HTTP_404_NOT_FOUND)

        password_recovery = password_recovery[0]
        if not password_recovery.check_expiration_date(datetime.datetime.now()):
            password_recovery.delete()
            return Response({
                'status': 'Not Found',
                'message': 'Invalid token'
            }, status=status.HTTP_404_NOT_FOUND)

        password_recovery_serialized = PasswordRecoverySerializer(password_recovery)
        return Response(password_recovery_serialized.data)

    def post(self, request, format=None):
        data = json.loads(request.body)
        account_id = data['account_id']
        account = Account.objects.get(id=account_id)

        if not account:
            return Response({
                'status': 'Not Found',
                'message': 'This account has not been found.'
            }, status=status.HTTP_404_NOT_FOUND)

        email = account.get_email()
        previous = PasswordRecovery.objects.filter(email=email)
        if previous:
            previous.delete()

        token = uuid.uuid4().hex[:40]
        expiration_date = datetime.datetime.now() + datetime.timedelta(days=1)

        password_recovery = PasswordRecovery.objects.create_password_recovery(email=email,
                                                                              token=token,
                                                                              expiration_date=expiration_date)
        password_recovery_serialized = PasswordRecoverySerializer(password_recovery)

        # Invalidate old password
        new_password = uuid.uuid4().hex[:10]
        account.set_password(new_password)
        account.save()

        return Response(password_recovery_serialized.data)


class UpdateNewPasswordView(views.APIView):
    def post(self, request, format=None):
        data = json.loads(request.body)

        email = data['email']
        password = data['password']
        account = Account.objects.filter(email=email)
        if not account:
            return Response({
                'status': 'Not Found',
                'message': 'This account has not been found.'
            }, status=status.HTTP_404_NOT_FOUND)

        account = account[0]
        account.set_password(password)
        account.save()
        password_recovery = PasswordRecovery.objects.filter(email=email)
        password_recovery[0].delete()
        return Response({}, status=status.HTTP_200_OK)


class AddressesView(views.APIView):

    def new_address(self, account, data):
        print("new_address %s"%data)

        print("Account : %s"%account)

        data_adresse = data['adresse']
        print("new_address(data_adresse : %s)\n"%data_adresse)
        try:
            adresse = Adresse.objects.create_adresse(account,
                                                     data_adresse['description'],
                                                     data_adresse['prenom'],
                                                     data_adresse['nom'],
                                                     data_adresse['adresse'],
                                                     data_adresse['complement_adresse'],
                                                     data_adresse['code_postal'],
                                                     data_adresse['ville'],
                                                     data_adresse['pays'],
                                                     data_adresse['livraison'],
                                                     data_adresse['facturation'])
        except Exception as e:
            print(e)

        print("Nouvelle adresse creee : %s"%adresse)
        print("Account update : %s"%account)
        #try:
        #    account.save()
        #except Exception as e:
        #    print(e)
        #print("Account saved : %s"%account)
        return Response({}, status=status.HTTP_200_OK)


    def update_address(self, account, data):
        print("update_address %s"%data)

        data_adresse = data['adresse']
        print("data_adresse : %s"%data_adresse)

        adresse_id = data_adresse['id']
        adresse = Adresse.objects.get(id=adresse_id)
        if not adresse:
            return Response({
                 'status': 'Not Found',
                 'message': 'This address has not been found.'
            }, status=status.HTTP_404_NOT_FOUND)

        adresse.description = data_adresse['description']
        adresse.prenom = data_adresse['prenom']
        adresse.nom = data_adresse['nom']
        adresse.adresse = data_adresse['adresse']
        adresse.complement_adresse = data_adresse['complement_adresse']
        adresse.code_postal = data_adresse['code_postal']
        adresse.ville = data_adresse['ville']
        adresse.pays = data_adresse['pays']
        adresse.livraison = data_adresse['livraison']
        adresse.facturation = data_adresse['facturation']

        adresse.save()

        print("Adresse updatee sauvee : %s"%adresse)
        print("Pour account : %s"%account)
        return Response({}, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        data = json.loads(request.body)

        account_id = data['account_id']

        print("account_id : %s"%str(account_id))
        account = Account.objects.get(id=account_id)
        if not account:
            return Response({
                 'status': 'Not Found',
                 'message': 'This account has not been found.'
            }, status=status.HTTP_404_NOT_FOUND)

        command = data['command']
        if command == 'create':
            return self.new_address(account, data)
        elif command == 'update':
            return self.update_address(account, data)

    def delete(self, request, format=None):

        try:
            adresse_id = request.query_params['adresse_id']
            adresse = Adresse.objects.get(id=adresse_id)
            adresse.delete()
        except Exception as e:
            print(e)

        return Response(status=status.HTTP_200_OK)




class SettingsView(views.APIView):
    pass


class LandingPageView(views.APIView):
    def index(request):
        return render(request, 'general/general.html', context)


class ConfigView(views.APIView):
    def get(self, request):
        local_dev = bool(os.environ.get('LOCAL_DEV', False))
        response_data = {}
        response_data['local_dev'] = str(local_dev)
        return Response(json.dumps(response_data), content_type="application/json")

