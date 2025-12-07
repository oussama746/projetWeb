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
    closing_reason = models.CharField(max_length=255, blank=True, null=True)
    company = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='company_offers')

    def __str__(self):
        return self.title

class Candidature(models.Model):
    STATUS_CHOICES = [
        ('En attente', 'En attente'),
        ('Acceptée', 'Acceptée'),
        ('Refusée', 'Refusée'),
    ]
    offer = models.ForeignKey(StageOffer, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    date_candidature = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='En attente')

    class Meta:
        unique_together = ('student', 'offer')

    def __str__(self):
        return f"{self.student.username} - {self.offer.title}"

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True, help_text="Courte présentation pour les recruteurs")
    cv = models.FileField(upload_to='cvs/', blank=True, null=True, help_text="Format PDF recommandé")
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"Profil de {self.user.username}"