# -*- coding: utf-8 -*-
from rest_framework import views, status
import json
from rest_framework.response import Response
from rest_framework import  status
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
from .models import SendgridApiKey, StaffEmail
from authentication.models import Account
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
        json_lesson = data['lesson']
        json_account = data['account']
        nb_persons = data['nb_persons']
        reservation_id = data['reservation_id']

        lesson_type = json_lesson['type']['nom']
        lesson_intensity = json_lesson['intensity']['nom']
        lesson_duration = json_lesson['duration']
        lesson_animator = json_lesson['animator']['prenom'] + " " + json_lesson['animator']['nom']
        lesson_date = str(parse_datetime(json_lesson['date']).strftime("%A %d %b %Y à %Hh%M"))
        cancellation_date = parse_datetime(json_lesson['date']) - datetime.timedelta(days=1)

        account = Account.objects.get(id=json_account['id'])

        staff_email = getEmails()

        subject = "Yoga - Votre réservation n°%s" % reservation_id
        message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Confirmation de réservation</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            <style>
               * {font-family: Montserrat, sans-serif;}
            </style>
            </head>
            <div style="font-family : Montserrat;font-size:120%%;color:#3f3f3f;">
               Bonjour %s,<br>

               Nous avons le plaisir de vous confirmer votre inscription pour %s personne%s au cours suivant :<br>
               Réservation n°: %s<br>
               %s %s<br>
               %s<br>
               %s <br>
               %s min<br><br>


               Votre nouveau solde de cours est de : %s cours. <br>

               Les tapis sont fournis et des vestiaires sont à votre disposition.
               Nous vous invitons à vous présenter environ 15 minutes avant le début du cours,
               munis d’une tenue confortable.<br><br>

               Si ce cours ne vous convenait plus, vous avez la possibilité de l’annuler jusqu’au %s. <br><br>

               Vous pouvez annuler cette réservation en allant sur <a style="font-family : Montserrat;font-size:120%%;color:#3f3f3f;" href="https://cafe-yoga.alwaysdata.net/yoga/annulation/%s">http://cafe-yoga.alwaysdata.net/yoga/annulation/%s</a><br><br>

               Cordialement, <br><br>
               L'équipe CafeAum   <br>
               <br>
            </div>
            </html>
        """%(account.get_first_name(),
             str(nb_persons),
             str("s" if nb_persons > 1 else ""),
             reservation_id,
             lesson_type,
             lesson_intensity,
             lesson_animator,
             lesson_date,
             lesson_duration,
             account.get_str_credits(),
             cancellation_date.strftime("%A %d %b %Y à %Hh%M"),
             reservation_id,
             reservation_id)

        return send_email(staff_email.noreply(),
                          account.get_email(),
                          message_content,
                          subject)


class CommandConfirmationToStaffEmailView(views.APIView):
    def post(self, request, format=None):
        data = json.loads(request.body)
        json_lesson = data['lesson']
        json_account = data['account']
        nb_persons = data['nb_persons']

        account = Account.objects.get(id=json_account['id'])

        staff_email = getEmails()

        subject = "Yoga - Nouvelle réservation de cours n°%s" % reservation_id
        message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Confirmation de réservation</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            <style>
               * {font-family: Montserrat, sans-serif;}
            </style>
            </head>
            <div style="font-family : Montserrat;font-size:120%%;color:#3f3f3f;">
               Une nouvelle réservation de cours a été effectuée en ligne : <br> <br>

               Réservation n° : %s <br>
               %s %s <br>
               %s personne%s <br>
               %s %s <br>
               %s <br>
               %s <br>
               %s min<br>
               <br>
            </div>
            </html>
        """%(reservation_id,
             account.get_first_name(),
             account.get_last_name(),
             str(nb_persons),
             str("s" if nb_persons > 1 else ""),
             lesson_type,
             lesson_intensity,
             lesson_animator,
             lesson_date,
             lesson_duration)

        return send_email(staff_email.noreply(),
                          staff_email.noreply(),
                          message_content,
                          subject)


class YogaCancellationToCustomerEmailView(views.APIView):

    def post(self, request, format=None):
        data = json.loads(request.body)
        json_lesson = data['lesson']
        json_account = data['account']
        nb_persons = data['nb_persons']
        reservation_id = data['reservation_id']

        lesson_type = json_lesson['type']['nom']
        lesson_intensity = json_lesson['intensity']['nom']
        lesson_animator = json_lesson['animator']['prenom'] + " " + json_lesson['animator']['nom']
        lesson_date = str(parse_datetime(json_lesson['date']).strftime("%A %d %b %Y à %Hh%M"))
        lesson_duration = json_lesson['duration']

        account = Account.objects.get(id=json_account['id'])

        staff_email = getEmails()

        subject = "Yoga - Annulation de votre réservation n°%s" % reservation_id
        message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Confirmation de réservation</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            <style>
               * {font-family: Montserrat, sans-serif;}
            </style>
            </head>
            <div style="font-family : Montserrat;font-size:120%%;color:#3f3f3f;">
            Bonjour %s,<br>

            Votre inscription pour %s personne%s au cours suivant a bien été annulée :<br>
            Numéro de réservation : %s<br>
            %s %s <br>
            %s <br>
            %s <br>
            %s min<br><br>

            Votre nouveau solde de cours : %s cours.<br><br>

            Cordialement,<br><br>

            L’équipe de Café Yoga<br><br>

            <br>
            </div>
            </html>
        """%(account.get_first_name(),
             str(nb_persons),
             str("s" if nb_persons > 1 else ""),
             reservation_id,
             lesson_type,
             lesson_intensity,
             lesson_animator,
             lesson_date,
             lesson_duration,
             account.get_str_credits())

        return send_email(staff_email.noreply(),
                          account.get_email(),
                          message_content,
                          subject)


class YogaCancellationToStaffEmailView(views.APIView):

    def post(self, request, format=None):
        data = json.loads(request.body)
        json_lesson = data['lesson']
        json_account = data['account']

        lesson_type = json_lesson['type']['nom']
        lesson_intensity = json_lesson['intensity']['nom']
        lesson_animator = json_lesson['animator']['prenom'] + " " + json_lesson['animator']['nom']
        lesson_date = str(parse_datetime(json_lesson['date']).strftime("%A %d %b %Y à %Hh%M"))
        lesson_duration = json_lesson['duration']

        nb_persons = data['nb_persons']
        account = Account.objects.get(id=json_account['id'])

        reservation_id = data['reservation_id']

        staff_email = getEmails()

        subject = "Yoga - annulation de la réservation n°%s" % reservation_id
        message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Confirmation de réservation</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            <style>
               * {font-family: Montserrat, sans-serif;}
            </style>
            </head>
            <div style="font-family : Montserrat;font-size:120%%;color:#3f3f3f;">
            La réservation suivante vient d’être annulée :<br><br>

            Numéro de réservation : %s<br>
            %s %s<br>
            %s personne%s<br>
            %s %s<br>
            %s<br>
            %s<br>
            %s min<br>
            <br>
            </div>
            </html>
        """%(str(reservation_id),
             account.get_first_name(),
             account.get_last_name(),
             str(nb_persons),
             str("s" if nb_persons > 1 else ""),
             lesson_type,
             lesson_intensity,
             lesson_animator,
             lesson_date,
             lesson_duration)

        return send_email(staff_email.noreply(),
                          staff_email.noreply(),
                          message_content,
                          subject)


class RestaurantReservationToStaffEmailView(views.APIView):

    def post(self, request, format=None):
        data = json.loads(request.body)

        personal_information = data['personal_information']
        reservation_information = data['reservation_information']

        staff_email = getEmails()

        subject = "Restaurant - Nouvelle demande de réservation [%s]" % reservation_information["human_date"]
        message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Demande de contact 2</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            </head>
            <p style="font-family : Montserrat;font-size:130%%;">
               CafeAum,<br><br>
               Une nouvelle demande de réservation vient d’être effectuée :<br>
               Numéro de réservation : %s<br>
               Nom: %s<br>
               Email : %s %s <br>
               Date : %s à %s<br>
               Pour: %s personne%s<br>
               %s
               <br><br>
            </p>
            </html>
        """%(reservation_information["reservation_id"],
             personal_information["name"],
             personal_information["email"],
             " / tel : %s" % personal_information["tel"] if personal_information["tel"] != "" else "",
             reservation_information["human_date"],
             reservation_information["hour"],
             reservation_information["nb_persons"],
             "s" if int(reservation_information["nb_persons"]) > 1 else "",
             "Son commentaire : <br> \"%s\""%('<br>'.join(personal_information["comment"].splitlines())) if personal_information["comment"] != "" else "",
             )

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


class RestaurantReservationToCustomerEmailView(views.APIView):

    def post(self, request, format=None):
        data = json.loads(request.body)

        personal_information = data['personal_information']
        reservation_information = data['reservation_information']

        staff_email = getEmails()

        subject = "Restaurant - Votre demande de réservation"
        message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Demande de contact 2</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            </head>
            <p style="font-family : Montserrat;font-size:130%%;">

               Cher client,<br><br>

               Votre demande de réservation au restaurant de Café Aum a bien été prise en compte :<br>
                   Numéro de réservation : %s<br>
                   Le %s <br>
                   à %s <br>
                   pour %s personne%s <br>
                   %s
               <br><br>

               Nous vous enverrons, au plus vite, par email, notre réponse à cette demande.
               Pour un retour encore plus rapide, n’hésitez pas à nous contacter par téléphone.<br><br>

              Cordialement,<br><br>

              L’équipe de Café Aum<br>
               <br>
            </p>
            </html>
        """%(reservation_information["reservation_id"],
             reservation_information["human_date"],
             reservation_information["hour"],
             reservation_information["nb_persons"],
             "s" if int(reservation_information["nb_persons"]) > 1 else "",
             '<br>'.join(personal_information["comment"].splitlines()) if personal_information["comment"] != "" else "",
             )

        sg = sendgrid.SendGridAPIClient(apikey=getApiKey())

        from_email = Email(staff_email.noreply())
        to_email = Email(personal_information["email"])
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


class ContactEmailView(views.APIView):

    def post(self, request, format=None):
        data = json.loads(request.body)
        print("ContactMessage : %s"%data)
        question = data['question']
        prenom = data['prenom']
        nom = data['nom']
        email = data['email']
        tel = data['tel']
        sujet = data['sujet']
        message = data['message']

        print("ContactMessage")

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
        print("PasswordRecoveryEmailView")
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


               L'équipe CafeAum
               <br>
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


def send_lesson_cancellation_email(account,
                                   reservation_id,
                                   type,
                                   intensity,
                                   animator,
                                   date,
                                   prix,
                                   duration,
                                   nb_personnes):
    staff_email = getEmails()
    subject = "Yoga - Annulation de votre réservation n°%s" % reservation_id
    message_content = """
         <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
         <html>
         <head>
         <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
         <title>Confirmation de réservation</title>
         <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
         <style>
            * {font-family: Montserrat, sans-serif;}
         </style>
         </head>
         <div style="font-family : Montserrat;font-size:120%%;color:#3f3f3f;">
         Bonjour %s,<br>

         Votre inscription pour %s personne%s au cours suivant a bien été annulée :<br>
         Numéro de réservation : %s<br>
         %s %s <br>
         %s <br>
         %s <br>
         %s min<br><br>

         Votre nouveau solde de cours : %s cours.<br><br>

         Cordialement,<br><br>

         L’équipe de Café Yoga<br><br>

         <br>
         </div>
         </html>
     """ % (account.get_first_name(),
            str(nb_personnes),
            str("s" if nb_personnes > 1 else ""),
            reservation_id,
            type,
            intensity,
            animator,
            date,
            duration,
            account.get_str_credits())

    return send_email(staff_email.noreply(),
                      account.get_email(),
                      message_content,
                      subject)


def send_lesson_modification_email(account,
                                   reservation_id,
                                   type,
                                   intensity,
                                   animator,
                                   date,
                                   old_type,
                                   old_intensity,
                                   old_date,
                                   duration):
    staff_email = getEmails()
    subject = "Yoga - Modification de votre cours - Réservation n°" % str(reservation_id)
    message_content = """
     <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
     <html>
    <head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <title>Modification de cours</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
    </head>
    <p style="font-family : Montserrat;font-size:130%%;">
       Bonjour %s,<br><br>
       Nous vous informons que votre cours du %s (%s %s) vient d'être modifié. <br><br>
       Nouveau cours : <br><br>
       %s %s
       %s
       %s
       %s min

       <br><br>

       Vous pouvez, si vous le souhaitez, annuler votre réservation en vous rendant sur <a href='http://cafeaum.fr'>Cafe Aum</a><br>

       <br><br>
       L'équipe CafeAum.
       <br>
    </p>
    </html>
    """ % (account.get_first_name(),
           old_date,
           old_type,
           old_intensity,
           type,
           intensity,
           animator,
           date,
           duration)

    return send_email(staff_email.noreply(),
                      account.get_email(),
                      message_content,
                      subject)
