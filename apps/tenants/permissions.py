from rest_framework import permissions


class IsTenantUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.tenant_id)


class IsTenantAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class HasGroup(permissions.BasePermission):
    required_group = None

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not self.required_group:
            return True
        return request.user.groups.filter(name=self.required_group).exists()


class HasAnyGroup(permissions.BasePermission):
    required_groups = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not self.required_groups:
            return True
        return request.user.groups.filter(name__in=self.required_groups).exists()
