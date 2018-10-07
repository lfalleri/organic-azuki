from django.db import models

class SendgridApiKey(models.Model):

    sendgrid_key = models.CharField(max_length=128, blank=True)

    def __unicode__(self):
        return self.sendgrid_key

    def __str__(self):
        return self.sendgrid_key

class StaffEmail(models.Model):

    noreply_email = models.EmailField(unique=True)
    contact_email = models.EmailField(unique=True)

    def __unicode__(self):
        return ' '.join(["No Reply : ", self.noreply_email, " - Contact : ", self.contact_email])


    def __str__(self):
        return ' '.join(["No Reply : ", self.noreply_email, " - Contact : ", self.contact_email])

    def noreply(self):
        return self.noreply_email

    def contact(self):
        return self.contact_email