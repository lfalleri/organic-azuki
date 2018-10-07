from rest_framework import permissions


class IsAuthorOfReservation(permissions.BasePermission):
    def has_object_permission(self, request, view, post):
        if request.user:
            return reservation.account == request.user
        return False