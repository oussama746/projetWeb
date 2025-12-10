import os
import django
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from django.db.models.functions import TruncMonth
import json
from django.core.serializers.json import DjangoJSONEncoder

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from stages.models import Candidature

print(f"Current Time: {timezone.now()}")

# Aggregation: Candidatures per month for last 12 months
one_year_ago = timezone.now() - timedelta(days=365)
print(f"One year ago: {one_year_ago}")

qs_stats = (
    Candidature.objects.filter(date_candidature__gte=one_year_ago)
    .annotate(month=TruncMonth('date_candidature'))
    .values('month')
    .annotate(count=Count('id'))
    .order_by('month')
)

print("\nRaw Query Result:")
for s in qs_stats:
    print(f"Month: {s['month']} (Type: {type(s['month'])}) - Count: {s['count']}")

# Transform qs_stats into a dict for easy lookup
stats_dict = {}
for s in qs_stats:
    if s['month']:
        key = s['month'].strftime('%Y-%m')
        stats_dict[key] = s['count']
        print(f"Dict Key: {key} -> {s['count']}")

# Generate last 12 months keys
labels = []
data = []
today = timezone.now()

print("\nLoop Generation:")
for i in range(12):
    # Calculate year and month going back i months
    y = today.year
    m = today.month - i
    while m <= 0:
        m += 12
        y -= 1
    
    key = f"{y}-{m:02d}"
    val = stats_dict.get(key, 0)
    print(f"i={i}: y={y}, m={m} -> key={key} -> val={val}")
    
    labels.append(key)
    data.append(val)

# Reverse to show chronological order (oldest -> newest)
labels.reverse()
data.reverse()

print("\nFinal Result:")
print(f"Labels: {labels}")
print(f"Data: {data}")
