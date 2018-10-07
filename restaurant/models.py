# -*- coding: utf-8 -*-
from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.utils.encoding import python_2_unicode_compatible
from authentication.models import Account
import json
from collections import namedtuple

import sys
reload(sys)
sys.setdefaultencoding('utf8')

DEFAULT_CARTE_ID = 1

JOUR_DE_SEMAINE = [
    (1, _("Monday")),
    (2, _("Tuesday")),
    (3, _("Wednesday")),
    (4, _("Thursday")),
    (5, _("Friday")),
    (6, _("Saturday")),
    (7, _("Sunday")),
]

class Carte(models.Model):
    nom = models.CharField(max_length=60)

    def __str__(self):
        return self.nom

    def __unicode__(self):
        return self.nom


class Categorie(models.Model):
    titre = models.CharField(max_length=60)

    def __unicode__(self):
        return self.titre

    def __str__(self):
        return self.titre


class Specificite(models.Model):
    titre = models.CharField(max_length=60)

    def __unicode__(self):
        return self.titre

    def __str__(self):
        return self.titre


class Plat(models.Model):
    class Meta:
        ordering = ('categorie', 'specificite', 'denomination',)

    carte = models.ForeignKey(Carte, default=DEFAULT_CARTE_ID, related_name="plats")
    categorie = models.ForeignKey(Categorie, on_delete=models.CASCADE)
    specificite = models.ForeignKey(Specificite, on_delete=models.CASCADE)
    denomination = models.CharField(max_length=30)
    ingredients = models.CharField(max_length=512)
    prix = models.IntegerField()

    def __unicode__(self):
        return ' | '.join([str(self.categorie), str(self.specificite), self.denomination, str(self.prix) + " €"])

    def __str__(self):
        return ' | '.join([str(self.categorie), str(self.specificite), self.denomination, str(self.prix) + " €"])


class Brunch(models.Model):
    carte = models.ForeignKey(Carte, default=DEFAULT_CARTE_ID, related_name="brunchs")
    didascalie = models.CharField(max_length=512, null=True)
    titre = models.CharField(max_length=80, default="")
    prix = models.IntegerField()

    def __unicode__(self):
        return ' | '.join([str(self.titre), str(self.prix) + " €"])

    def __str__(self):
        return ' | '.join([str(self.titre), str(self.prix) + " €"])


class BrunchItem(models.Model):
    brunch = models.ForeignKey(Brunch, related_name='items')
    plat = models.CharField(max_length=80)
    est_en_option = models.BooleanField(default=False)
    prix_option = models.IntegerField(blank=True, default=0)

    def __unicode__(self):
        return ' | '.join([str(self.plat), str("Option" if self.est_en_option else "Base"), str(self.prix_option) if self.est_en_option else ""])

    def __str__(self):
        return ' | '.join([str(self.plat), str("Option" if self.est_en_option else "Base"), str(self.prix_option) if self.est_en_option else ""])


class Boisson(models.Model):
    carte = models.ForeignKey(Carte, default=DEFAULT_CARTE_ID, related_name="boissons")
    categorie = models.ForeignKey(Categorie, on_delete=models.CASCADE)
    nom = models.CharField(max_length=80)
    prix = models.FloatField()

    def __unicode__(self):
        return ' | '.join([self.nom, str(self.categorie), str(self.prix)])

    def __str__(self):
        return ' | '.join([self.nom, str(self.categorie), str(self.prix)])


class RestaurantConfig(models.Model):
    nb_couverts = models.IntegerField(default=30)
    nb_couverts_par_table = models.IntegerField(default=2)

    def __str__(self):
        return _("%(nb_couverts)s / %(nb_couverts_par_table)s") % {
            'nb_couverts': self.nb_couverts,
            'nb_couverts_par_table' : self.nb_couverts_par_table,
        }


@python_2_unicode_compatible
class JourDeSemaine(models.Model):
    """
    Store opening times of company premises,
    defined on a daily basis (per day) using one or more
    start and end times of opening slots.
    """
    class Meta:
        verbose_name = _("Jour de la semaine")  # plurale tantum
        verbose_name_plural = _("Jours de la semaine")
        ordering = ['config', 'weekday']

    config = models.ForeignKey(RestaurantConfig, verbose_name=_('Config'), related_name='jours')
    weekday = models.IntegerField(_('Jours'), choices=JOUR_DE_SEMAINE)

    def __str__(self):
        return _("%(weekday)s ") % {
            'weekday': JOUR_DE_SEMAINE[self.weekday - 1][1],
        }


class SlotOuverture(models.Model):
    jour = models.ForeignKey(JourDeSemaine, related_name='slots')
    from_hour = models.TimeField(_('Ouverture'))
    to_hour = models.TimeField(_('Fermeture'))

    def __str__(self):
        return _("Ouvert de %(from_hour)s  %(to_hour)s") % {
            'from_hour': self.from_hour,
            'to_hour':  self.to_hour,
        }


@python_2_unicode_compatible
class Fermeture(models.Model):
    """
    Used to overrule the OpeningHours. This will "close" the store due to
    public holiday, annual closing or private party, etc.
    """
    class Meta:
        verbose_name = _('Fermeture')
        verbose_name_plural = _('Fermeture')
        ordering = ['debut']

    config = models.ForeignKey(RestaurantConfig, verbose_name=_('Config'), related_name='fermetures')
    debut = models.DateTimeField(_('Début'))
    fin = models.DateTimeField(_('Fin'))
    raison = models.TextField(_('Raison'), null=True, blank=True)

    def __str__(self):
        return _("Closed from %(debut)s to %(fin)s\
        due to %(raison)s") % {
            'debut': str(self.debut),
            'fin': str(self.fin),
            'raison': self.raison
        }


class RestaurantReservationManager(models.Manager):

    def create_reservation(self, config, reservation_info, personal_info):
        reservation_slot = self.create_reservation_slot(config, reservation_info)
        if not reservation_slot:
            return False, "Impossible de créer la réservation. Veuillez prendre contact avec notre équipe par téléphone."
        reservation_slot.save(force_insert=True)

        reservation_contact = self.create_reservation_contact(reservation_slot, personal_info, reservation_info)
        if not reservation_contact:
            return False, "Impossible de créer la réservation. Veuillez prendre contact avec notre équipe par téléphone."
        reservation_contact.save()

        return True, "Nous avons bien reçu votre demande de réservation et reviendrons vers vous au plus vite par email."

    def create_reservation_slot(self, config,  reservation_info):
        nb_places_par_table = config.nb_couverts_par_table
        nb_persons = reservation_info["nb_persons"]
        if nb_persons % nb_places_par_table == 0:
            nb_tables = nb_persons / nb_places_par_table
        else:
            nb_tables = nb_persons / nb_places_par_table + 1
        nb_places_total = config.nb_couverts - (nb_tables * nb_places_par_table)
        reservation_slot = RestaurantReservationSlot(date=reservation_info["date"],
                                                     hour=reservation_info["hour"],
                                                     nb_places_restantes=nb_places_total)
        return reservation_slot

    def create_reservation_contact(self, reservation_slot,  personal_info, reservation_info):
        if "comment" not in personal_info.keys():
            personal_info["comment"] = ""
        if "tel" not in personal_info.keys():
            personal_info["tel"] = ""
        reservation_contact = RestaurantReservationContact(reservation_slot=reservation_slot,
                                                           nom=personal_info["name"],
                                                           email=personal_info["email"],
                                                           telephone=personal_info["tel"],
                                                           comment=personal_info["comment"],
                                                           nb_persons=reservation_info["nb_persons"])
        return reservation_contact

    def update_reservation(self, config, reservation_slot, reservation_info, personal_info):
        nb_places_restantes = reservation_slot.nb_places_restantes
        nb_persons = reservation_info["nb_persons"]
        nb_places_par_table = config.nb_couverts_par_table

        if nb_places_restantes - nb_persons < 0:
            return False, "Nombre de places insuffisant, nous vous invitons à contacter notre équipe directement par téléphone."

        if nb_persons % nb_places_par_table == 0:
            nb_tables = nb_persons / nb_places_par_table
        else:
            nb_tables = nb_persons / nb_places_par_table + 1
        nb_places_restantes -= (nb_tables * nb_places_par_table)
        if nb_places_restantes < 0:
            return False, "Nombre de places insuffisant, nous vous invitons à contacter notre équipe directement par téléphone."

        # Update reservation_slot
        reservation_slot.nb_places_restantes = nb_places_restantes
        reservation_slot.save()

        # Create reservation_contact
        reservation_contact = self.create_reservation_contact(reservation_slot, personal_info, reservation_info)
        if not reservation_contact:
            return False, "Impossible de créer votre contact. Nous nous excusons pour la gêne occasionnée"

        reservation_contact.save()
        return True, "Nous avons bien reçu votre demande de réservation et reviendrons vers vous au plus vite par email."


class RestaurantReservationSlot(models.Model):

    date = models.DateTimeField(auto_now_add=False)
    hour = models.CharField(max_length=8)
    nb_places_restantes = models.IntegerField()
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, db_index=True)

    objects = RestaurantReservationManager()

    def __unicode__(self):
        return ' '.join([str(self.date.date()), "à", self.hour, "- Restent ", str(self.nb_places_restantes), "places"])

    def __str__(self):
        return ' '.join([str(self.date.date()), "à", self.hour, "- Restent ", str(self.nb_places_restantes), "places"])


class RestaurantReservationContact(models.Model):

    reservation_slot = models.ForeignKey(RestaurantReservationSlot, related_name='contacts')
    nom = models.CharField(max_length=128)
    email = models.EmailField()
    telephone = models.CharField(max_length=64, blank=True)
    comment = models.CharField(max_length=512, blank=True)
    nb_persons = models.IntegerField()

    objects = RestaurantReservationManager()

    def __unicode__(self):
        return ' '.join([self.nom, "(",
                         str(self.email), ") (",
                         self.telephone,
                         ") a réservé pour ", str(self.nb_persons),
                         "personnes le : ", str(self.reservation_slot)])

    def __str__(self):
        return ' '.join([self.nom, "(",
                         str(self.email), ") (",
                         self.telephone,
                         ") a réservé pour ", str(self.nb_persons),
                         "personnes le : ", str(self.reservation_slot)])



