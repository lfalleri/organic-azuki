# -*- coding: utf-8 -*-
from rest_framework import views, status
import json
from rest_framework.response import Response
from rest_framework import  status
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
from .models import SendgridApiKey, StaffEmail
from yoga.models import Lesson
from authentication.models import Account
import sendgrid
from sendgrid.helpers.mail import Email, Content, Mail, Attachment

def getApiKey():
    key = SendgridApiKey.objects.get(id=1)
    return key

def getEmails():
    emails = StaffEmail.objects.get(id=1)
    return emails


class YogaConfirmationEmailView(views.APIView):

    def post(self, request, format=None):
        data = json.loads(request.body)
        json_lesson = data['lesson']
        json_account = data['account']
        nb_persons = data['nb_persons']

        lesson = Lesson.objects.get(id=json_lesson['id'])
        account = Account.objects.get(id=json_account['id'])

        staff_email = getEmails()

        subject = "Confirmation de réservation"
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
               Nous vous confirmons votre réservation pour le cours : <br><br>

               <div style="font-family : Montserrat;">
               %s %s (animé par %s) <br>
               le %s, pour %s personne%s <br><br>
               </div >

               Vous pouvez annuler cette réservation en allant sur <a href="http://cafeaum.fr/yoga/calendrier">CafeAum</a><br><br>

               Bonne journée, <br>
               L'équipe CafeAum   <br>
               <br>
            </div>
            </html>
        """%(account.get_first_name(), lesson.get_type(), lesson.get_intensity(), lesson.get_str_animator(), lesson.get_str_date(), str(nb_persons), str("s" if nb_persons > 1 else ""))

        sg = sendgrid.SendGridAPIClient(apikey=getApiKey())

        from_email = Email(staff_email.noreply())
        to_email = Email(account.get_email())
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


class RestaurantReservationEmailView(views.APIView):

    def post(self, request, format=None):
        data = json.loads(request.body)

        personal_information = data['personal_information']
        reservation_information = data['reservation_information']

        staff_email = getEmails()

        subject = "Réservation de table"
        message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Demande de contact 2</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            </head>
            <p style="font-family : Montserrat;font-size:130%%;">
               CafeAum,<br>
               %s (email : %s %s) souhaite réserver une table le %s à %s pour %s personne%s. <br>
               %s
               <br><br>

               Merci de lui répondre dans les meilleurs délais.

               <br>
            </p>
            </html>
        """%(personal_information["name"],
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


class ContactEmailView(views.APIView):

    def post(self, request, format=None):
        data = json.loads(request.body)

        type = data['type']
        name = data['name']
        email = data['email']
        tel = data['tel']
        message = data['message']

        staff_email = getEmails()

        if type == "Réserver une table":
            subject = "Réservation de table"
            message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Demande de contact 2</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            </head>
            <p style="font-family : Montserrat;font-size:130%%;">
               CafeAum,<br>
               %s (email : %s / tel : %s) souhaite réserver une table. Son message :<br>

               "%s"
               <br><br>

               Merci de lui répondre dans les meilleurs délais.

               <br>
            </p>
            </html>
            """%(name, email, tel, '<br>'.join(message.splitlines()))
        else:
            subject = "Demande de contact"
            message_content = """
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html>
            <head>
            <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
            <title>Demande de contact 2</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
            </head>
            <p style="font-family : Montserrat;font-size:130%%;">
               CafeAum,<br>
               %s (email : %s / tel : %s) a laissé une demande de contact. Son message :<br>

               "%s"
               <br><br>

               Merci de lui répondre dans les meilleurs délais.

               <br>
            </p>
            </html>
            """%(name, email, tel, '<br>'.join(message.splitlines()))

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
