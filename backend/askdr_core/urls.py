from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse

urlpatterns = [
    path('', lambda request: JsonResponse({"message": "Welcome to AskDr.AI API"})),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/symptoms/', include('symptoms.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/medications/', include('medications.urls')),   
    path('api/chat/', include('chat.urls')),
    path('api/reminders/', include('reminders.urls')),
    path('api/clinics/', include('clinics.urls')),
    path('api/mentalhealth/', include('mentalhealth.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/features/', include('features.urls')),
]
