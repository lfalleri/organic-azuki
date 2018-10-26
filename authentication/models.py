# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth.models import AbstractBaseUser
from django.db import models
from django.contrib.auth.models import BaseUserManager
from django.contrib.auth.models import PermissionsMixin

class AccountManager(BaseUserManager):
    def create_user(self, email, password=None, **kwargs):
        print("create_user")
        if not email:
            raise ValueError('Users must have a valid email address.')

        if not kwargs.get('last_name') and not kwargs.get('first_name'):
            raise ValueError('Users must have a valid last_name.')
        print("create_user 2 ")
        account = self.model(
            email=self.normalize_email(email),
            first_name=kwargs.get('first_name'),
            last_name=kwargs.get('last_name'),
        )
        print("create_user 3")
        account.set_password(password)
        account.save()
        return account

    def update_user(self, email, password=None, **kwargs):
        if not email:
            raise ValueError('Users must have a valid email address.')

        if not kwargs.get('last_name') and not kwargs.get('first_name'):
            raise ValueError('Users must have a valid last_name.')

        account = self.model(
            email=self.normalize_email(email),
            first_name=kwargs.get('first_name'),
            last_name=kwargs.get('last_name'),
        )

        account.set_password(password)
        account.save()
        return account

    def create_superuser(self, email, password, **kwargs):
        account = self.create_user(email, password, **kwargs)

        account.is_admin = True
        account.is_staff = True
        account.is_superuser = True

        account.save()
        return account


class Account(AbstractBaseUser):
    class Meta:
        ordering = ('last_name', 'first_name',)

    email = models.EmailField(unique=True)

    first_name = models.CharField(max_length=40, blank=True)
    last_name = models.CharField(max_length=40, blank=True)

    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    #adresse_de_livraison = models.ForeignKey(Adresse, blank=True, null=True, on_delete=models.CASCADE, related_name="adresse_de_livraison")
    #adresse_de_facturation = models.ForeignKey(Adresse, blank=True,null=True,on_delete=models.CASCADE, related_name="adresse_de_facturation")

    objects = AccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __unicode__(self):
        return ' '.join([self.first_name, self.last_name])#self.email

    def __str__(self):
        return ' '.join([self.first_name, self.last_name, '('+self.email+')' ])

    def get_full_name(self):
        return ' '.join([self.first_name, self.last_name])

    def get_short_name(self):
        return ' '.join([self.first_name, self.last_name])

    def get_last_name(self):
        return self.last_name

    def get_first_name(self):
        return self.first_name

    def get_email(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return self.is_admin == True

    def has_module_perms(self, package_name):
        return self.is_admin == True


class PasswordRecoveryManager(models.Manager):
    def create_password_recovery(self, email, token, expiration_date):
        pwd_recovery = PasswordRecovery(email=email, token=token, expiration_date=expiration_date)
        pwd_recovery.save(force_insert=True)
        return pwd_recovery


class PasswordRecovery(models.Model):
    email = models.EmailField(unique=True)
    token = models.CharField(max_length=40, unique=True)
    expiration_date = models.DateTimeField()

    objects = PasswordRecoveryManager()

    def __unicode__(self):
        return ' '.join([self.email, '|', self.token, '| Expire à ', str(self.expiration_date)])

    def __str__(self):
        return ' '.join([self.email, '|', self.token, '| Expire à ', str(self.expiration_date)])

    def check_expiration_date(self, now):
        if self.expiration_date > now:
            return True
        return False

    def get_expiration_date(self):
        return self.expiration_date


class AdresseManager(models.Manager):
    def create_adresse(self,
                       account,
                       description,
                       prenom,
                       nom,
                       adresse,
                       complement_adresse,
                       code,
                       ville,
                       pays,
                       livraison,
                       facturation):
        print("AdresseManager")
        print("create_adresse : %s  %s %s %s %s %s %s %s %s"%(description,
                                                              account,
                                                              prenom,
                                                              nom,
                                                              adresse,
                                                              complement_adresse,
                                                              code,
                                                              ville,
                                                              pays))

        new_adresse = Adresse(description=description,
                          account=account,
                          prenom=prenom,
                          nom=nom,
                          adresse=adresse,
                          complement_adresse=complement_adresse,
                          code_postal=code,
                          ville=ville,
                          pays=pays,
                          livraison=livraison,
                          facturation=facturation)

        print("adresse : %s"%new_adresse)

        new_adresse.save(force_insert=True)
        print("APRES SAVE ")
        return adresse

    def set_livraison_and_facturation(self, adresse, livraison, facturation):
        adresse.livraison = livraison
        adresse.facturation = facturation
        adresse.save()


class Adresse(models.Model):
    class Meta:
        ordering = ('description',)

    description = models.CharField(max_length=40)
    livraison = models.BooleanField(default=True)
    facturation = models.BooleanField(default=True)

    prenom = models.CharField(max_length=40)
    nom = models.CharField(max_length=40)
    adresse = models.CharField(max_length=128)
    complement_adresse = models.CharField(max_length=128, blank=True)
    code_postal = models.IntegerField()
    ville = models.CharField(max_length=64, blank=True)
    pays = models.CharField(max_length=32, blank=True)

    account = models.ForeignKey(Account,  on_delete=models.CASCADE, related_name="adresses")

    objects = AdresseManager()

    def __unicode__(self):
        return ' '.join([self.prenom, self.nom, '(', self.adresse, str(self.code_postal), self.ville, self.pays, ')'])

    def __str__(self):
        return ' '.join([self.prenom, self.nom, '(', self.adresse, str(self.code_postal), self.ville, self.pays, ')'])

