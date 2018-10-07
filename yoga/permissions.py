from rest_framework import permissions


class IsAuthorOfReservation(permissions.BasePermission):
    def has_permission(self, request, view, obj):
        if request.user:
            return obj.account == request.user
        return False