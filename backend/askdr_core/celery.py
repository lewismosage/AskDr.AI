import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'askdr_core.settings')

app = Celery('askdr_core')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
