# billing/middleware.py
from rest_framework.exceptions import PermissionDenied

class ChatAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        if request.path.startswith('/api/chat/') and request.user.is_authenticated:
            if not request.user.profile.can_use_chat_feature():
                raise PermissionDenied("You've reached your monthly message limit")