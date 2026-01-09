from django.contrib import admin
from .models import ServiceOrder, ServiceOrderLaborLine, ServiceOrderPartLine, Attachment


class ServiceOrderLaborLineInline(admin.TabularInline):
    model = ServiceOrderLaborLine
    extra = 1


class ServiceOrderPartLineInline(admin.TabularInline):
    model = ServiceOrderPartLine
    extra = 1


class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 1


@admin.register(ServiceOrder)
class ServiceOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'unit', 'status', 'tenant', 'opened_at')
    list_filter = ('status', 'is_comeback', 'tenant')
    inlines = [ServiceOrderLaborLineInline, ServiceOrderPartLineInline, AttachmentInline]


@admin.register(ServiceOrderLaborLine)
class ServiceOrderLaborLineAdmin(admin.ModelAdmin):
    list_display = ('service_order', 'tech', 'hours', 'rate', 'tenant')
    list_filter = ('tenant',)


@admin.register(ServiceOrderPartLine)
class ServiceOrderPartLineAdmin(admin.ModelAdmin):
    list_display = ('service_order', 'part', 'qty', 'tenant')
    list_filter = ('tenant',)


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('service_order', 'file', 'tenant')
    list_filter = ('tenant',)
