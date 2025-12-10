from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import StageOffer, StudentProfile

class StageOfferForm(forms.ModelForm):
    class Meta:
        model = StageOffer
        fields = ['title', 'organisme', 'contact_name', 'contact_email', 'description']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }

class StageOfferFormAuthenticated(forms.ModelForm):
    class Meta:
        model = StageOffer
        # 'organisme' est exclu car rempli automatiquement avec le nom de l'utilisateur
        fields = ['title', 'contact_name', 'contact_email', 'description']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }

class StudentProfileForm(forms.ModelForm):
    class Meta:
        model = StudentProfile
        fields = ['phone', 'bio', 'cv']
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Ex: Étudiant en 3ème année, passionné par...'}),
            'phone': forms.TextInput(attrs={'placeholder': 'Ex: 06 12 34 56 78'}),
        }

class CustomUserCreationForm(UserCreationForm):
    ROLE_CHOICES = [
        ('etudiant', 'Étudiant (Cherche un stage)'),
        ('entreprise', 'Entreprise (Propose des stages)'),
    ]
    role = forms.ChoiceField(choices=ROLE_CHOICES, widget=forms.RadioSelect, label="Je suis")
    email = forms.EmailField(required=True, label="Adresse Email")

    class Meta(UserCreationForm.Meta):
        model = User
        fields = UserCreationForm.Meta.fields + ('email',)