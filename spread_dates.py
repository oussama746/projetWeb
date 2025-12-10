import os
import django
import random
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from stages.models import Candidature

print("Spreading candidatures over the last 6 months...")

candidatures = list(Candidature.objects.all())
now = timezone.now()

for c in candidatures:
    # Random days back between 0 and 180 (approx 6 months)
    days_back = random.randint(0, 180)
    new_date = now - timedelta(days=days_back)
    
    # Update the date
    c.date_candidature = new_date
    c.save()
    print(f"Moved candidature {c.id} to {new_date.strftime('%Y-%m-%d')}")

print("Done.")
