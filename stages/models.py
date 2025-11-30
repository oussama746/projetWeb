from django.db import models
from django.contrib.auth.models import User

class StageOffer(models.Model):
    STATE_CHOICES = [
        ('En attente validation', 'En attente validation'),
        ('Validée', 'Validée'),
        ('Refusée', 'Refusée'),
        ('Clôturée', 'Clôturée'),
    ]

    organisme = models.CharField(max_length=100)
    contact_name = models.CharField(max_length=100)
    contact_email = models.EmailField()
    date_depot = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    state = models.CharField(max_length=30, choices=STATE_CHOICES, default='En attente validation')

    def __str__(self):
        return self.title

class Candidature(models.Model):
    offer = models.ForeignKey(StageOffer, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    date_candidature = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'offer')

    def __str__(self):
        return f"{self.student.username} - {self.offer.title}"