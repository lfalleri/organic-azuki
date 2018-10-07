# -*- coding: utf-8 -*-
import json
from rest_framework import views, status
from rest_framework.response import Response
from authentication.models import Account
from .models \
    import Reference, \
           ReferencePhoto, \
           Collection, \
           Categorie, \
           MotCle, \
           TypeDePhoto, \
           Panier, \
           Article, \
           Createur, Exposition, ExpositionPhoto

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
    CreateurSerializer, ExpositionPhotoSerializer, ExpositionSerializer


class CollectionView(views.APIView):
    def get(self, request, format=None):
        print("CollectionView  ")
        collection = Collection.objects.all()
        print("CollectionView  collection = %s", collection[0])
        try:
           serialized_collection = CollectionSerializer(collection[0])
        except Exception as e:
            print(e)
        print("CollectionView  serialized_collection = %s", serialized_collection.data)
        return Response(serialized_collection.data)


class ReferenceView(views.APIView):
    def get(self, request, format=None):
        ref = Reference.objects.all()
        serialized_ref = ReferenceSerializer(ref, many=True)
        return Response(serialized_ref.data)


class PanierView(views.APIView):
    def create_panier(self, data):
        print("create_panier : %s"%data)
        account_id = data['account_id']
        panier = Panier.objects.create_panier(account_id)
        panier_serialized = PanierSerializer(panier)
        return Response(panier_serialized.data)


    def associate_panier_and_account(self, data):
        print("associate_panier_and_account : %s"%data)

    def add_to_panier(self, data):
        print("add_to_panier : %s"%data)
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

    def remove_from_panier(selfself, data):
        print("remove_from_panier : %s"%data)
        token = data['uuid']
        article_id = data['article']['id']
        reference = Panier.objects.remove_article_to_panier(uuid=token,
                                                            article_id=article_id)
        print("remove_from_panier : reference = %s"%reference)
        reference_serialized = ReferenceSerializer(reference)
        return Response(reference_serialized.data)

    def post(self, request, format=None):
        data = json.loads(request.body)

        command = data['command']
        if command == 'create':
            return self.create_panier(data)
        elif command == 'associate':
            return self.associate_panier_and_account(data)
        elif command == 'add':
            return self.add_to_panier(data)
        elif command == 'remove':
            return self.remove_from_panier(data)


    def get_panier(self, token):
        panier = Panier.objects.filter(uuid=token)[0]
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
