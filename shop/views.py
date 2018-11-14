# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json
from rest_framework import views, status
from rest_framework.response import Response
from authentication.models import Account, Adresse
from .models \
    import Reference, \
           ReferencePhoto, \
           Collection, \
           Categorie, \
           MotCle, \
           TypeDePhoto, \
           Panier, \
           Article, \
           ModeDeLivraison,\
           CodeReduction,\
           StripeAPiKey,\
           Transaction,\
           Commande


from .serializers \
    import \
    ReferenceSerializer, \
    ReferencePhotoSerializer, \
    CollectionSerializer,\
    CategorieSerializer,\
    MotCleSerializer,\
    TypeDePhotoSerializer,\
    PanierSerializer, \
    ArticleSerializer, \
    ModeDeLivraisonSerializer,\
    CodeReductionSerializer,\
    TransactionSerializer,\
    CommandeSerializer


import stripe
import datetime


class CollectionView(views.APIView):
    def get(self, request, format=None):
        collection = Collection.objects.all()
        serialized_collection = CollectionSerializer(collection[0])
        return Response(serialized_collection.data)


class ReferenceView(views.APIView):
    def get(self, request, format=None):
        ref = Reference.objects.all()
        serialized_ref = ReferenceSerializer(ref, many=True)
        return Response(serialized_ref.data)


class PanierView(views.APIView):
    def create_panier(self):
        panier = Panier.objects.create_panier()
        panier_serialized = PanierSerializer(panier)
        return Response(panier_serialized.data)

    def add_to_panier(self, data):
        token = data['uuid']
        reference_id = data['reference']['id']
        quantite = data['quantite']
        taille = data['taille']
        reference = Panier.objects.add_article_to_panier(uuid=token,
                                                      reference_id=reference_id,
                                                      quantite=quantite,
                                                      taille=taille)
        reference_serialized = ReferenceSerializer(reference)
        return Response(reference_serialized.data)

    def remove_from_panier(self, data):
        token = data['uuid']
        article_id = data['article']['id']
        reference = Panier.objects.remove_article_from_panier(uuid=token,
                                                            article_id=article_id)
        reference_serialized = ReferenceSerializer(reference)
        return Response(reference_serialized.data)

    def validate_panier(self, data):
        token = data['uuid']
        panier = Panier.objects.validate_panier(uuid=token)
        panier_serialized = PanierSerializer(panier)
        return Response(panier_serialized.data)

    def post(self, request, format=None):
        data = json.loads(request.body)

        command = data['command']
        if command == 'create':
            return self.create_panier()
        elif command == 'add':
            return self.add_to_panier(data)
        elif command == 'remove':
            return self.remove_from_panier(data)
        elif command == 'validate':
            return self.validate_panier(data)

    def get_panier(self, token):
        paniers = Panier.objects.filter(expiration_date__lte=datetime.datetime.now(),
                                        validee=False)
        for p in paniers:
            p.delete()

        panier = Panier.objects.filter(uuid=token)
        if not panier:
            return self.create_panier()

        panier = panier[0]
        panier_serialized = PanierSerializer(panier)
        return Response(panier_serialized.data)

    def get_articles_count(self, token):
        return Response(Panier.objects.get_articles_count(token))

    def get_articles(self, token):
        articles = Panier.objects.get_articles(token)
        articles_serialized = ArticleSerializer(articles, many=True)
        return Response(articles_serialized.data)

    def get(self, request, format=None):
        token = request.query_params['uuid']
        command = request.query_params['command']
        if command == 'panier':
            return self.get_panier(token)
        elif command == 'articles_count':
            return self.get_articles_count(token)
        elif command == 'articles':
            return self.get_articles(token)


class ModeDeLivraisonView(views.APIView):
    def get(self, request, format=None):
        data = ModeDeLivraison.objects.all()
        serialized_data = ModeDeLivraisonSerializer(data, many=True)
        return Response(serialized_data.data)


class CodeReductionView(views.APIView):
    def get(self, request, format=None):
        code = request.query_params['code']
        codes = CodeReduction.objects.filter(code=code)
        if codes:
            codes = codes[0]
            serialized_data = CodeReductionSerializer(codes)
            return Response(serialized_data.data)

        return Response(status=status.HTTP_404_NOT_FOUND)


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

    def charge(self, data):
        account_id = data['account_id']
        montant = data['montant']
        panier_uuid = data['panier_uuid']
        token = data['token']

        stripe.api_key = str(StripeAPiKey.objects.all().first())

        # "sk_test_ZgA3fIz8UXgmhZpwXg8Aej5V"
        account = Account.objects.get(id=account_id)
        if not account:
            return Response({
                'status': 'Unauthorized',
                'message': "Utilisateur non trouvé"
            }, status=status.HTTP_404_NOT_FOUND)

        panier = Panier.objects.filter(uuid=panier_uuid)
        if not panier:
            return Response({
                'status': 'Unauthorized',
                'message': "Utilisateur non trouvé"
            }, status=status.HTTP_404_NOT_FOUND)

        panier = panier.first()

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

        transaction = Transaction.objects.create_transaction(account, charge.id, montant, token)
        transaction.save()
        Commande.objects.create_commande(account, transaction, panier)

        serialized = TransactionSerializer(transaction)
        return Response(serialized.data)

    def post(self, request, format=None):
        data = json.loads(request.body)

        command = data['command']
        if command == "charge":
            return self.charge(data)




class CommandeView(views.APIView):
    def addInfo(self, data):
        commande_id = data['commande_id']
        commande = Commande.objects.get(id=commande_id)

        if 'comment' in data.keys():
            comment = data['comment']
            if comment != "":
                commande.commentaire = comment

        if 'code_id' in data.keys():
            code_id = data['code_id']
            if code_id != -1:
                code = CodeReduction.objects.get(id=code_id)
                commande.code_reduction = code

        if 'mode_livraison_id' in data.keys():
            mode_livraison_id = data['mode_livraison_id']
            if mode_livraison_id != -1:
                mode = ModeDeLivraison.objects.get(id=mode_livraison_id)
                commande.mode_de_livraison = mode

        if 'adresse_livraison_id' in data.keys():
            adresse_livraison_id = data['adresse_livraison_id']
            if adresse_livraison_id != -1:
                adresse_livraison = Adresse.objects.get(id=adresse_livraison_id)
                commande.adresse_livraison = adresse_livraison

        if 'adresse_facturation_id' in data.keys():
            adresse_facturation_id = data['adresse_facturation_id']
            if adresse_facturation_id != -1:
                adresse_facturation = Adresse.objects.get(id=adresse_facturation_id)
                commande.adresse_facturation = adresse_facturation

        commande.save()
        serialized = CommandeSerializer(commande)
        return Response(serialized.data)

    def update(self, data):
        commande_id = data['commande_id']
        commande = Commande.objects.get(id=commande_id)

        if 'etat' in data.keys():
            etat = data['etat']
            commande.etat = etat

        commande.save()
        serialized = CommandeSerializer(commande)
        return Response(serialized.data)

    def get(self, request, format=None):
        account = None
        many = True
        commandes = []

        if 'account_id' in request.query_params.keys():
            account_id = request.query_params['account_id']
            account = Account.objects.get(id=account_id)
            if not account:
                return Response(status=status.HTTP_404_NOT_FOUND)
            commandes = Commande.objects.filter(account=account)

        if "command" in request.query_params.keys() and request.query_params['command'] == 'all':
            if account.is_staff:
                commandes = Commande.objects.all()
            else:
                return Response(status=status.HTTP_401_UNAUTHORIZED)

        if 'transaction_id' in request.query_params.keys():
            transaction_id = request.query_params['transaction_id']
            transaction = Transaction.objects.get(id=int(transaction_id))
            commandes = Commande.objects.filter(transaction=transaction)
            if commandes:
                commandes = commandes[0]
                many = False
            else:
                return Response(status=status.HTTP_404_NOT_FOUND)

        serialized = CommandeSerializer(commandes, many=many)
        return Response(serialized.data)

    def post(self, request, format=None):
        data = json.loads(request.body)
        commande_id = data['commande_id']
        commande = Commande.objects.get(id=commande_id)

        function = data["command"]
        if function == "addInfo":
            return self.addInfo(data)
        elif function == "update":
            return self.update(data)

        return Response(status=status.HTTP_403_FORBIDDEN)

    def delete(self, request, format=None):
        commande_id = request.query_params['commande_id']
        commande = Commande.objects.get(id=commande_id)

        account_id=request.query_params['account_id']
        account = Account.objects.get(id=account_id)

        try:
            Transaction.objects.refund_transaction(commande)
        except ValueError as e:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        commande.etat = "ANNULEE"
        panier = commande.panier
        articles = Article.objects.filter(panier=panier)
        for article in articles:
            Panier.objects.remove_article_from_panier(uuid=panier.uuid,
                                                          article_id=article.id)

        commande.save()
        return Response(status=status.HTTP_200_OK)

