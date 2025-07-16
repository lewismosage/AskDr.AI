# users/urls.py
from django.urls import path
from .views import RegisterView, UserView, ChangePasswordView, DeleteAccountView, UpdateProfileView
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('me/', UserView.as_view(), name='user-detail'),
    path('me/update/', UpdateProfileView.as_view(), name='update-profile'),
    path('change_password/', ChangePasswordView.as_view(), name='change-password'),
    path('delete_account/', DeleteAccountView.as_view(), name='delete-account'),
]
