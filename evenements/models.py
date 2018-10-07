# -*- coding: utf-8 -*-
from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.utils.encoding import python_2_unicode_compatible


class Evenement(models.Model):
    class Meta:
       ordering = ('date',)

    titre = models.CharField(max_length=60)
    didascalie = models.CharField(max_length=512, blank=True)
    date = models.DateTimeField()
    texte = models.TextField()
    prix = models.FloatField()
    image = models.CharField(max_length=128, default='/static/img/...')

    def __str__(self):
        return ' | '.join([self.titre, self.texte[0:10] + "..."])

    def __unicode__(self):
        return ' | '.join([self.titre, self.texte[0:10] + "..."])

