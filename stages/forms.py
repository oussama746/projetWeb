from django import forms
from .models import StageOffer

class StageOfferForm(forms.ModelForm):
    class Meta:
        model = StageOffer
        fields = ['organisme', 'contact_name', 'contact_email', 'title', 'description']
