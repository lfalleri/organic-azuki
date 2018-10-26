# -*- coding: utf-8 -*-
from django.db import models
from authentication.models import Account, Adresse

import uuid
import datetime
import stripe
from django.dispatch import receiver
from django.db.models.signals import pre_delete
from django.utils.translation import ugettext_lazy as _
from django.utils.encoding import python_2_unicode_compatible
from __future__ import unicode_literals



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
                           str(self.prix) + "euros",
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
                           str(self.prix) + "euros",
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
    reference = models.ForeignKey(Reference, related_name="images")
    type_de_photo = models.ForeignKey(TypeDePhoto, related_name="images")

    def __str__(self):
        return ' | '.join([str(self.main_image), str(self.type_de_photo)])

    def __unicode__(self):
        return ' | '.join([str(self.main_image), str(self.type_de_photo)])


class PanierManager(models.Manager):
    def create_panier(self):
        token = uuid.uuid4().hex[:40]
        expiration_date = datetime.datetime.now() + datetime.timedelta(minutes=15)
        panier = Panier(uuid=token, expiration_date=expiration_date)
        panier.save()
        return panier

    def add_article_to_panier(self, uuid, reference_id, quantite, taille):
        panier = Panier.objects.filter(uuid=uuid)
        if not panier:
             return None

        reference = Reference.objects.get(id=reference_id)

        panier = panier[0]

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

        return reference

    def remove_article_from_panier(self, uuid, article_id):
        panier = Panier.objects.filter(uuid=uuid)
        if not panier:
            return None

        article = Article.objects.get(id=article_id)
        reference = article.reference
        taille = article.taille
        quantite = article.quantite

        panier = panier[0]

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
        article.delete()

        return reference

    def get_articles_count(self, uuid):
        panier = Panier.objects.filter(uuid=uuid)
        if not panier:
            return None

        panier = panier[0]
        total_count = 0
        articles = panier.articles.all()
        for article in articles:
            total_count += article.quantite
        return total_count

    def get_articles(self, uuid):
        panier = Panier.objects.filter(uuid=uuid)
        if not panier:
            return []

        panier = panier[0]
        return panier.articles.all()

    def validate_panier(self, uuid):
        panier = Panier.objects.filter(uuid=uuid)
        if not panier:
            return None

        panier = panier[0]
        panier.validee = True
        panier.save()
        return panier


class Panier(models.Model):
    uuid = models.CharField(max_length=40, unique=True)
    expiration_date = models.DateTimeField()
    validee = models.BooleanField(default=False)

    objects = PanierManager()

    def __str__(self):
        return ' | '.join([self.uuid])

    def __unicode__(self):
        return ' | '.join([self.uuid])


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
        return ' | '.join([unicode(self.reference), str(self.taille), str(self.quantite)])

    def __unicode__(self):
        return ' | '.join([unicode(self.reference), str(self.taille), str(self.quantite)])


class ModeDeLivraison(models.Model):
    description = models.CharField(max_length=64)
    nom = models.CharField(max_length=16)
    prix = models.IntegerField()
    international = models.BooleanField(default=False)

    def __str__(self):
        return ' | '.join([self.nom, str(self.prix)])

    def __unicode__(self):
        return ' | '.join([self.nom, str(self.prix)])


class CodeReduction(models.Model):
    code = models.CharField(max_length=10)
    reduction = models.IntegerField(default=0)

    def __unicode__(self):
        return ' '.join(["Code :", str(self.code), u"- Réduction : ", str(self.reduction) + " euros"])

    def __str__(self):
        return ' '.join(["Code :", str(self.code), u"- Réduction : ", str(self.reduction) + " euros"])


class StripeAPiKey(models.Model):
    key = models.CharField(max_length=64)

    def __unicode__(self):
        return ' '.join([self.key])

    def __str__(self):
        return ' '.join([self.key])


class TransactionManager(models.Manager):
    def create_transaction(self, account, charge_id, montant, token):
        transaction = Transaction(account=account, charge_id=charge_id, montant=montant, token=token)
        transaction.save(force_insert=True)
        return transaction

    def refund_transaction(self, commande):
        stripe.api_key = str(StripeAPiKey.objects.all().first())

        # "sk_test_ZgA3fIz8UXgmhZpwXg8Aej5V"
        transaction = commande.transaction
        charge = transaction.charge_id
        montant = transaction.montant

        try:
           refund = stripe.Refund.create(
               charge=charge,
               amount=int(montant) * 100,
           )
        except Exception as inst:
           raise ValueError('Error')

        transaction.status = "Refund"
        transaction.refund_id = refund.id
        transaction.save()


class Transaction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    charge_id = models.CharField(max_length=64)
    montant = models.FloatField(default=0.0)
    token = models.CharField(max_length=64)
    created = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=64, default="Charge")
    refund_id = models.CharField(max_length=64, null=True)

    objects = TransactionManager()

    def __unicode__(self):
        return ' '.join([str(self.account), str(self.montant) + " €", self.token])

    def __str__(self):
        return ' '.join([str(self.account), str(self.montant) + " €", self.token])


class CommandeManager(models.Manager):
    def create_commande(self, account, transaction, panier):
        panier.validee = True
        panier.save()
        commande = Commande(account=account, transaction=transaction, panier=panier)
        commande.save()
        return commande


class Commande(models.Model):
    EN_COURS = 'EN COURS'
    EXPEDIEE = 'EXPEDIEE'
    TERMINEE = 'TERMINEE'
    RETOURNEE = 'RETOURNEE'
    REMBOURSEE = 'REMBOURSEE'
    ANNULEE = 'ANNULEE'

    ETAT_COMMANDE = (
        (EN_COURS, 'EN COURS'),
        (EXPEDIEE, 'EXPEDIEE'),
        (TERMINEE, 'TERMINEE'),
        (RETOURNEE, 'RETOURNEE'),
        (REMBOURSEE, 'REMBOURSEE'),
        (ANNULEE, 'ANNULEE'),
    )

    etat = models.CharField(max_length=30, choices=ETAT_COMMANDE, default=EN_COURS)
    account = models.ForeignKey(Account, related_name='commandes')
    adresse_livraison = models.ForeignKey(Adresse, blank=True, null=True, related_name="adresse_livraison")
    adresse_facturation = models.ForeignKey(Adresse, blank=True, null=True, related_name="adresse_facturation")
    panier = models.ForeignKey(Panier, on_delete=models.CASCADE, related_name='commande')
    transaction = models.ForeignKey(Transaction, related_name='commande')
    date = models.DateTimeField(auto_now_add=True)
    mode_de_livraison = models.ForeignKey(ModeDeLivraison, blank=True, null=True, related_name="commandes")
    commentaire = models.TextField(blank=True)
    code_reduction = models.ForeignKey(CodeReduction, blank=True, null=True, related_name="commandes")

    objects = CommandeManager()

    def __unicode__(self):
        return ' '.join([str(self.account), str(self.panier), str(self.date)])

    def __str__(self):
        return ' '.join([str(self.account), str(self.panier), str(self.date)])


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


@receiver(pre_delete, sender=Panier)
def unlock_reference_before_deleting_panier(sender, instance, **kwargs):

    articles = Article.objects.filter(panier=instance)

    for article in articles:
        Panier.objects.remove_article_from_panier(uuid=instance.uuid,
                                                  article_id=article.id)


