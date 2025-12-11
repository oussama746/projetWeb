from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Session authentication without CSRF check for development.
    """
    def enforce_csrf(self, request):
        return  # Skip CSRF check
