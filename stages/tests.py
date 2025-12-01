from django.test import TestCase, Client
from django.contrib.auth.models import User, Group
from .models import StageOffer, Candidature
from django.urls import reverse

class StageTests(TestCase):
    def setUp(self):
        # Create groups
        self.group_etudiant = Group.objects.create(name='Etudiant')
        
        # Create students
        self.students = []
        for i in range(6):
            u = User.objects.create_user(username=f'student{i}', password='password', email=f'student{i}@test.com')
            u.groups.add(self.group_etudiant)
            self.students.append(u)
            
        # Create offer
        self.offer = StageOffer.objects.create(
            title='Test Offer',
            state='Validée',
            contact_email='test@test.com',
            organisme='Test Org',
            contact_name='Tester',
            description='Desc'
        )
        
    def test_application_limit(self):
        c = Client()
        
        # Apply with first 5 students
        for i in range(5):
            c.login(username=f'student{i}', password='password')
            url = reverse('student_apply', args=[self.offer.pk])
            c.get(url)
            
            # Verify candidature created
            self.assertTrue(Candidature.objects.filter(student=self.students[i], offer=self.offer).exists())
            c.logout()
            
        # Refresh offer
        self.offer.refresh_from_db()
        self.assertEqual(self.offer.state, 'Clôturée')
        
        # Try 6th student
        c.login(username='student5', password='password')
        url = reverse('student_apply', args=[self.offer.pk])
        c.get(url)
        
        # Verify NO candidature for 6th (because offer is closed logic might prevent showing it, 
        # but wait, does the view check if it's closed? The View creates candidature if count < 5.
        # If count is 5, it enters 'if count < 5:' -> False. So no creation.
        self.assertFalse(Candidature.objects.filter(student=self.students[5], offer=self.offer).exists())

    def test_unique_candidature(self):
        c = Client()
        c.login(username='student0', password='password')
        url = reverse('student_apply', args=[self.offer.pk])
        
        # First app
        c.get(url)
        count = Candidature.objects.filter(student=self.students[0], offer=self.offer).count()
        self.assertEqual(count, 1)
        
        # Second app (same user)
        c.get(url)
        count = Candidature.objects.filter(student=self.students[0], offer=self.offer).count()
        self.assertEqual(count, 1) # Should still be 1