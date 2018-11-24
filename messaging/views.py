# -*- coding: utf-8 -*-
from rest_framework import views, status
import json
from rest_framework.response import Response
from rest_framework import  status
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
from .models import SendgridApiKey, StaffEmail
from authentication.models import Account
from shop.models import Commande, Article, Panier
from django.utils.dateparse import parse_datetime
import sendgrid
from sendgrid.helpers.mail import Email, Content, Mail, Attachment
import datetime


def getApiKey():
    key = SendgridApiKey.objects.get(id=1)
    return key


def getEmails():
    emails = StaffEmail.objects.get(id=1)
    return emails


def send_email(from_email, to_email, content, subject):
    sg = sendgrid.SendGridAPIClient(apikey=getApiKey())

    from_email = Email(from_email)
    to_email = Email(to_email)
    content = Content("text/html", content)
    mail = Mail(from_email, subject, to_email, content)

    response = sg.client.mail.send.post(request_body=mail.get())

    if (response.status_code >= 200) and (response.status_code < 300):
        return Response({
            'status': 'OK',
            'message': 'Email sent'
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'status': 'KO',
            'message': 'Error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AccountCreationEmailView(views.APIView):
    def post(self, request, format=None):
        data = json.loads(request.body)
        json_email = data['email']

        staff_email = getEmails()
        account = Account.objects.filter(email=json_email)
        if not account:
            return Response({
                'status': 'Not found',
                'message': 'Account not found'
            }, status=status.HTTP_404_NOT_FOUND)

        account = account[0]

        subject = "Création de compte"
        message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Création de compte</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            <style>
               * {font-family: Montserrat, sans-serif;}
            </style>
            </head>
            <div style="font-family : Montserrat;font-size:120%%;color:#3f3f3f;">
               Bienvenue %s,<br>
               Vous venez de créer un compte sur <a href="http://www.organicazuki.com">Organic Azuki</a>. <br><br>
               Votre identifiant est : %s<br><br>

               Vous pouvez dès à présent vous connecter <a href="http://www.organicazuki.com">sur le site</a> et passer commande ! <br><br>

               Si vous avez des questions, n’hésitez pas à nous écrire à <a href="http://mailto:contact@organicazuki.com">contact@organicazuki.com</a>.<br><br>

               À très bientôt.<br>
               Organic Azuki<br>
               <br>
            </div>
            </html>
        """%(account.get_first_name(),
             account.get_email())

        return send_email(staff_email.noreply(),
                          json_email,
                          message_content,
                          subject)


class AccountDeletionToCustomerEmailView(views.APIView):
    def post(self, request, format=None):
        data = json.loads(request.body)
        json_email = data['email']
        json_first_name = data['first_name']
        json_last_name = data['last_name']
        staff_email = getEmails()

        subject = "Au revoir"
        message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Création de compte</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            <style>
                * {font-family: Montserrat, sans-serif;}
            </style>
            </head>
            <div style="font-family : Montserrat;font-size:120%%;color:#3f3f3f;">
                Bonjour %s,<br>

                Nous vous informons que votre compte client a bien été supprimé.<br><br>

                N’hésitez pas à nous contacter, pour nous faire part de vos remarques sur votre expérience parmi nous.<br><br>

                Cordialement,<br><br>

                L’équipe de Café Aum<br><br>
            </div>
            </html>
        """ % (json_first_name)

        return send_email(staff_email.noreply(),
                          json_email,
                          message_content,
                          subject)


class AccountDeletionToStaffEmailView(views.APIView):
    def post(self, request, format=None):
        data = json.loads(request.body)
        json_email = data['email']
        json_first_name = data['first_name']
        json_last_name = data['last_name']
        json_account_id = data['account_id']

        staff_email = getEmails()

        subject = "Suppression d'un compte client"
        message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Création de compte</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            <style>
                * {font-family: Montserrat, sans-serif;}
            </style>
            </head>
            <div style="font-family : Montserrat;font-size:120%%;color:#3f3f3f;">
                Un nouveau compte vient d’être supprimé :<br>
                Numéro de compte : %s<br>
                %s %s<br>
                %s<br>

            </div>
            </html>
        """ % (json_account_id,
               json_first_name,
               json_last_name,
               json_email)

        return send_email(staff_email.noreply(),
                          staff_email.contact(),
                          message_content,
                          subject)


class CommandConfirmationToCustomerEmailView(views.APIView):

    def post(self, request, format=None):
        data = json.loads(request.body)

        json_commande = data['commande']
        json_account = data['account']

        commande = Commande.objects.get(id=json_commande['id'])
        account = Account.objects.get(id=json_account['id'])

        staff_email = getEmails()

        articles = Panier.objects.get_articles(commande.panier.uuid)
        articles_detail = ""
        for article in articles:
            articles_detail += article.reference.nom + u" - Quantité : " + str(article.quantite) \
                               + u" (" + str(article.taille) + u") - Prix : " + str(article.reference.prix * article.quantite) + u" €"
            articles_detail += u"<br>"

        subject = u"Confirmation de commande"
        message_content = u"""
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Confirmation de commande</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            <style>
               * {font-family: Montserrat, sans-serif;}
            </style>
            </head>
            <div style="font-family : Montserrat;font-size:120%%;color:#3f3f3f;">
                <h3> Confirmation de commande </h3>
                Votre commande %s a bien été prise en compte, merci pour votre confiance !<br>
                Vous trouverez ci-dessous un récapitulatif de vos achats.<br>
                Si toutefois vous changez d’avis, vous avez 1h pour annuler votre commande. <br>
                Pour cela, il suffit de vous rendre sur votre espace Mon Compte sur le site.<br><br>
                Vous serez tenu(e) au courant de l’expédition de votre commande.<br>

                <h3>Rappel de votre commande</h3>

                %s<br>

                Cout total de la commande (frais de port inclus): %s €<br><br>

                Adresse de livraison : %s<br><br>
                Adresse de facturation : %s<br><br><br>


               A très bientot, <br>
               <strong>Organic Azuki</strong>   <br>
               <br>
            </div>
            </html>
        """%(str(commande.unique_id),
             articles_detail,
             str(commande.transaction.montant),
             commande.adresse_livraison,
             commande.adresse_facturation)

        return send_email(staff_email.noreply(),
                          account.get_email(),
                          message_content,
                          subject)


class CommandConfirmationToStaffEmailView(views.APIView):
    def post(self, request, format=None):
        data = json.loads(request.body)

        json_account = data['account']
        json_commande = data['commande']

        account = Account.objects.get(id=json_account['id'])
        commande = Commande.objects.get(id=json_commande['id'])

        staff_email = getEmails()

        subject = u"Nouvelle commande n°%s"%commande.unique_id
        message_content = u"""
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Nouvelle commande</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            <style>
               * {font-family: Montserrat, sans-serif;}
            </style>
            </head>
            <div style="font-family : Montserrat;font-size:120%%;color:#3f3f3f;">
                <h3>Nouvelle commande</h3>
                   Une nouvelle commande (n° %s) a été effectuée par %s %s
               <br>
            </div>
            </html>
        """%(commande.unique_id,
             account.get_first_name(),
             account.get_last_name(),)

        return send_email(staff_email.noreply(),
                          staff_email.noreply(),
                          message_content,
                          subject)


class ContactEmailView(views.APIView):

    def post(self, request, format=None):
        data = json.loads(request.body)
        question = data['question']
        prenom = data['prenom']
        nom = data['nom']
        email = data['email']
        tel = data['tel']
        sujet = data['sujet']
        message = data['message']

        staff_email = getEmails()
        subject = "Demande de contact : %s"%sujet
        message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Demande de contact</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            </head>
            <p style="font-family : Montserrat;font-size:130%%;">
               Organic Azuki,<br>
               %s %s (email : <a href="mailto:%s">%s</a> / tel : %s) a laissé une demande de contact. <br>
               Son message concerne "%s"<br><br>

               Son message :<br>
               "%s" <br><br>

               "%s"
               <br><br>

               <br>
            </p>
            </html>
        """%(prenom, nom, email,email, tel, question, sujet, '<br>'.join(message.splitlines()))

        sg = sendgrid.SendGridAPIClient(apikey=getApiKey())

        from_email = Email(staff_email.noreply())
        to_email = Email(staff_email.contact())
        content = Content("text/html", message_content)
        mail = Mail(from_email, subject, to_email, content)

        response = sg.client.mail.send.post(request_body=mail.get())

        if (response.status_code >= 200) and (response.status_code < 300):
            return Response({
                'status': 'OK',
                'message': 'Email sent'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': 'KO',
                'message': 'Error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordRecoveryEmailView(views.APIView):
    def post(self, request, format=None):
        data = json.loads(request.body)

        email = data['email']
        token = data['token']

        staff_email = getEmails()

        subject = "Renouvellement de mot de passe"
        message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Renouvellement de mot de passe</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            </head>
            <p style="font-family : Montserrat;font-size:130%%;">
               Bonjour,<br>
               Pour mettre à jour votre mot de passe, veuillez cliquer sur le lien suivant : <br>
               <a href="http://www.organicazuki.com/recovery/%s">http://www.organicazuki.com/recovery/%s</a><br>

               Attention ce lien n'est valide que pour 24h, aussi nous vous recommandons de modifier votre mot de passe dès que possible.<br><br>


               <strong>Organic Azuki</strong><br>
            </p>
            </html>
        """%(token,token)

        sg = sendgrid.SendGridAPIClient(apikey=getApiKey())

        from_email = Email(staff_email.noreply())
        to_email = Email(email)
        content = Content("text/html", message_content)
        mail = Mail(from_email, subject, to_email, content)

        response = sg.client.mail.send.post(request_body=mail.get())

        if (response.status_code >= 200) and (response.status_code < 300):
            return Response({
                'status': 'OK',
                'message': 'Email sent'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': 'KO',
                'message': 'Error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

