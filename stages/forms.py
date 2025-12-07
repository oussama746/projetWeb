from django import forms
from .models import StageOffer, StudentProfile

class StageOfferForm(forms.ModelForm):
    class Meta:
        model = StageOffer
        fields = ['title', 'organisme', 'contact_name', 'contact_email', 'description']
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