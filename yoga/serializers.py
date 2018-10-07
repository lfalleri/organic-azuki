from django.contrib.auth import update_session_auth_hash

from rest_framework import serializers

from authentication.serializers import AccountSerializer
from .models import Lesson, Reservation, Professeur, UploadedImage, Transaction, Formule,CodeReduction


class UploadedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedImage
        fields = ('id', 'image',)


class ProfesseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professeur
        fields = ('id', 'nom', 'prenom', 'lien', 'description',
                  'photo')


class LessonSerializer(serializers.ModelSerializer):
    animator = ProfesseurSerializer(read_only=False, required=True)

    class Meta:
        model = Lesson
        fields = ('id', 'type', 'intensity', 'animator', 'date',
                  'duration', 'nb_places', 'price')

        def create(self, validated_data):
            return Lesson.objects.create(**validated_data)

        def update(self, instance, validated_data):
            instance.date = validated_data.get('date', instance.date)
            instance.save()
            return instance

class ReservationSerializer(serializers.ModelSerializer):
    account = AccountSerializer(read_only=False, required=False)
    lesson = LessonSerializer(read_only=False, required=False)

    class Meta:
        model = Reservation
        fields = ('id', 'account', 'lesson', 'nb_personnes', 'checked_present', 'nb_present', 'confirmed', 'created', 'updated')

        def create(self, validated_data):
            return Reservation.objects.create(**validated_data)

        def update(self, instance, validated_data):
            instance.date = validated_data.get('date', instance.date)
            instance.save()
            return instance


class FormuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formule
        fields = ('id', 'montant', 'nb_cours', 'description')


class CodeReductionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeReduction
        fields = ('id', 'code', 'pourcentage')


class TransactionSerializer(serializers.ModelSerializer):
    account = AccountSerializer(read_only=False, required=False)

    class Meta:
        model = Transaction
        fields = ('id', 'account', 'montant', 'token', 'created')