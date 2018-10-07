from django.contrib.auth import update_session_auth_hash

from rest_framework import serializers

from authentication.models import Account, Adresse, PasswordRecovery

class AdresseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adresse
        fields = ('id', 'description', 'livraison', 'facturation', 'prenom', 'nom', 'adresse',
                  'complement_adresse', 'code_postal', 'ville', 'pays')

class AccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Account
        fields = ('id',
                  'email',
                  'created_at',
                  'updated_at',
                  'first_name',
                  'last_name',
                  'password',
                  'confirm_password')
        read_only_fields = ('created_at', 'updated_at',)

        def create(self, validated_data):
            return Account.objects.create(**validated_data)

        def update(self, instance, validated_data):

            instance.tagline = validated_data.get('tagline', instance.tagline)

            instance.save()

            password = validated_data.get('password', None)
            confirm_password = validated_data.get('confirm_password', None)

            if password and confirm_password and password == confirm_password:
                instance.set_password(password)
                instance.save()

            update_session_auth_hash(self.context.get('request'), instance)

            return instance


class FullAccountSerializer(serializers.ModelSerializer):
    adresses = AdresseSerializer(many=True)

    class Meta:
        model = Account
        fields = ('id',
                  'email',
                  'created_at',
                  'updated_at',
                  'first_name',
                  'last_name',
                  'adresses',
                  'password',
                  'is_staff',
                  'is_admin')
        read_only_fields = ('created_at', 'updated_at', 'credits', 'is_staff', 'is_admin')


class PasswordRecoverySerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordRecovery
        fields = ('id', 'email', 'token')
