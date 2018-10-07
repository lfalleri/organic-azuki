# -*- coding: utf-8 -*-
from django.db import models
from authentication.models import Account

import uuid
import datetime
from django.utils.translation import ugettext_lazy as _
from django.utils.encoding import python_2_unicode_compatible



class Collection(models.Model):
    nom = models.CharField(max_length=32, default="Collection")

    def __str__(self):
        return self.nom

    def __unicode__(self):
        return self.nom


class Categorie(models.Model):
    nom = models.CharField(max_length=32)  # robes, manteaux, tops...
    liste = models.ForeignKey(Collection, related_name="categories")

    def __str__(self):
        return self.nom

    def __unicode__(self):
        return self.nom





class MotCle(models.Model):
    mot_cle = models.CharField(max_length=32)

    def __str__(self):
        return self.mot_cle

    def __unicode__(self):
        return self.mot_cle


class Reference(models.Model):
    nom = models.CharField(max_length=40)
    description = models.TextField(default="")
    short_description = models.CharField(max_length=128)
    prix = models.FloatField()
    color = models.CharField(max_length=32)
    xxs_restants = models.IntegerField(default=0)
    xs_restants = models.IntegerField(default=0)
    s_restants = models.IntegerField(default=0)
    m_restants = models.IntegerField(default=0)
    l_restants = models.IntegerField(default=0)
    xl_restants = models.IntegerField(default=0)
    xxl_restants = models.IntegerField(default=0)

    categorie = models.ForeignKey(Categorie, related_name="references")
    mot_cles = models.ManyToManyField(MotCle)

    def __str__(self):
        return ' | '.join([self.nom,
                           str(self.prix) + "€",
                           str(self.xxs_restants) + "XXS",
                           str(self.xs_restants) + "XS",
                           str(self.s_restants) + "S",
                           str(self.m_restants) + "M",
                           str(self.l_restants) + "L",
                           str(self.xl_restants) + "XL",
                           str(self.xxl_restants) + "XXL",
                           ])

    def __unicode__(self):
        return ' | '.join([self.nom,
                           str(self.prix) + "€",
                           str(self.xxs_restants) + "XXS",
                           str(self.xs_restants) + "XS",
                           str(self.s_restants) + "S",
                           str(self.m_restants) + "M",
                           str(self.l_restants) + "L",
                           str(self.xl_restants) + "XL",
                           str(self.xxl_restants) + "XXL",
                           ])


class TypeDePhoto(models.Model):
    type_de_photo = models.CharField(max_length=32)

    def __str__(self):
        return self.type_de_photo

    def __unicode__(self):
        return self.type_de_photo


class ReferencePhoto(models.Model):
    main_image = models.ImageField(upload_to='', null=True)
    image = models.ForeignKey(Reference, related_name="images")
    type_de_photo = models.ForeignKey(TypeDePhoto, related_name="images")

    def __str__(self):
        return ' | '.join([str(self.main_image), str(self.type_de_photo)])

    def __unicode__(self):
        return ' | '.join([str(self.main_image), str(self.type_de_photo)])


class PanierManager(models.Manager):
    def create_panier(self, account_id):
        token = uuid.uuid4().hex[:40]
        expiration_date = datetime.datetime.now() + datetime.timedelta(minutes=15)
        account = None
        if account_id != -1:
           account = Account.objects.get(id=account_id)

        print("create_panier ==> (account:%s, token:%s, expiration_date:%s)"%(account, token, expiration_date))
        panier = Panier(uuid=token, expiration_date=expiration_date, account=account)
        print("create_panier ==> panier : %s"%panier)
        panier.save()
        print("create_panier ==> panier saved")

        return panier

    def add_article_to_panier(self, uuid, reference_id, quantite, taille):
        panier = Panier.objects.filter(uuid=uuid)
        if not panier:
             print("add_article_to_panier ==> paniers not found")

        reference = Reference.objects.get(id=reference_id)

        panier = panier[0]
        print("add_article_to_panier ==> panier : %s" % panier)
        print("add_article_to_panier ==> reference : %s" % reference)
        print("add_article_to_panier ==> taille : %s" % taille)
        print("add_article_to_panier ==> quantite : %s" % quantite)

        panier.articles.create(reference=reference, taille=taille, quantite=quantite)

        if taille == 'XXS':
            reference.xxs_restants -= quantite
        if taille == 'XS':
            reference.xs_restants -= quantite
        if taille == 'S':
            reference.s_restants -= quantite
        if taille == 'M':
            reference.m_restants -= quantite
        if taille == 'L':
            reference.l_restants -= quantite
        if taille == 'XL':
            reference.xl_restants -= quantite
        if taille == 'XXL':
            reference.xxl_restants -= quantite
        reference.save()

        print("add_article_to_panier ==> article saved")
        try:
            print("add_article_to_panier ==> articles du panier : %s"% panier.articles.all())
        except Exception as e:
            print(e)
        return reference

    def remove_article_to_panier(self, uuid, article_id):
        panier = Panier.objects.filter(uuid=uuid)
        if not panier:
             print("add_article_to_panier ==> paniers not found")

        article = Article.objects.get(id=article_id)
        reference = article.reference
        taille = article.taille
        quantite = article.quantite

        panier = panier[0]
        print("remove_article_to_panier ==> panier : %s" % panier)
        print("remove_article_to_panier ==> article : %s" % article)
        print("remove_article_to_panier ==> reference : %s" % reference)
        print("remove_article_to_panier ==> taille : %s" % str(taille))
        print("remove_article_to_panier ==> quantite : %s" % str(quantite))

        if taille == 'XXS':
            reference.xxs_restants += quantite
        if taille == 'XS':
            reference.xs_restants += quantite
        if taille == 'S':
            reference.s_restants += quantite
        if taille == 'M':
            reference.m_restants += quantite
        if taille == 'L':
            reference.l_restants += quantite
        if taille == 'XL':
            reference.xl_restants += quantite
        if taille == 'XXL':
            reference.xxl_restants += quantite
        reference.save()
        print("remove_article_to_panier ==> reference apres update: %s" % reference)
        article.delete()

        print("remove_article_to_panier ==> article deleted")
        try:
            print("remove_article_to_panier ==> articles du panier : %s"% panier.articles.all())
        except Exception as e:
            print(e)
        return reference

    def get_articles_count(self, uuid):
        panier = Panier.objects.filter(uuid=uuid)
        if not panier:
             print("get_articles_count ==> paniersnot found")

        panier = panier[0]
        total_count = 0
        articles = panier.articles.all()
        for article in articles:
            total_count += article.quantite
        return total_count

    def get_articles(self, uuid):
        panier = Panier.objects.filter(uuid=uuid)
        if not panier:
             print("add_article_to_panier ==> paniers not found")

        panier = panier[0]
        return panier.articles.all()




class Panier(models.Model):
    uuid = models.CharField(max_length=40, unique=True)
    expiration_date = models.DateTimeField()
    account = models.ForeignKey(Account, null=True, related_name="panier")

    objects = PanierManager()

    def __str__(self):
        return ' | '.join([self.uuid, str(self.account)])

    def __unicode__(self):
        return ' | '.join([self.uuid, str(self.account)])


class Article(models.Model):
    TAILLE_XXS = 'XXS'
    TAILLE_XS = 'XS'
    TAILLE_S = 'S'
    TAILLE_M = 'M'
    TAILLE_L = 'L'
    TAILLE_XL = 'XL'
    TAILLE_XXL = 'XXL'
    TAILLE = (
        (TAILLE_XXS, 'XXS'),
        (TAILLE_XS, 'XS'),
        (TAILLE_S, 'S'),
        (TAILLE_M, 'M'),
        (TAILLE_L, 'L'),
        (TAILLE_XL, 'XL'),
        (TAILLE_XXL, 'XXL'),
    )
    reference = models.ForeignKey(Reference, related_name="reference")
    panier = models.ForeignKey(Panier, related_name="articles")
    taille = models.CharField(max_length=3, choices=TAILLE, default=TAILLE_S)
    quantite = models.IntegerField(default=1)

    def __str__(self):
        return ' | '.join([str(self.reference), str(self.taille), str(self.quantite)])

    def __unicode__(self):
        return ' | '.join([str(self.reference), str(self.taille), str(self.quantite)])











class Createur(models.Model):
    nom = models.CharField(max_length=60)
    texte = models.TextField()
    image = models.CharField(max_length=128, default='/static/img/...')

    def __str__(self):
        return ' | '.join([self.nom, self.texte[0:10] + "..."])

    def __unicode__(self):
        return ' | '.join([self.nom, self.texte[0:10] + "..."])


class Exposition(models.Model):
    titre = models.CharField(max_length=60)
    artiste = models.CharField(max_length=60)
    photo_artiste = models.CharField(max_length=128,default='/static/img/...')

    en_cours = models.BooleanField(default=True)

    texte = models.TextField()
    didascalie = models.CharField(max_length=512, blank=True)

    def __str__(self):
        return ' | '.join([self.titre, self.artiste])

    def __unicode__(self):
        return ' | '.join([self.titre, self.artiste])


class ExpositionPhoto(models.Model):
    exposition = models.ForeignKey(Exposition, related_name='photos')
    photo = models.CharField(max_length=128,default='/static/img/...')
    legende = models.CharField(max_length=128)

    def __str__(self):
        return ' '.join(["Photo de ", self.exposition.titre, self.legende])

    def __unicode__(self):
        return ' '.join(["Photo de ", self.exposition.titre, self.legende])



