from django.db import models
from django.utils import timezone
from apps.tenants.models import TenantScopedModel


class ServiceOrderStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    AWAITING_APPROVAL = 'awaiting_approval', 'Awaiting Approval'
    APPROVED = 'approved', 'Approved'
    IN_PROGRESS = 'in_progress', 'In Progress'
    READY_TO_INVOICE = 'ready_to_invoice', 'Ready to Invoice'
    INVOICED = 'invoiced', 'Invoiced'
    CLOSED = 'closed', 'Closed'


ALLOWED_STATUS_TRANSITIONS = {
    ServiceOrderStatus.DRAFT: {ServiceOrderStatus.AWAITING_APPROVAL},
    ServiceOrderStatus.AWAITING_APPROVAL: {ServiceOrderStatus.APPROVED},
    ServiceOrderStatus.APPROVED: {ServiceOrderStatus.IN_PROGRESS},
    ServiceOrderStatus.IN_PROGRESS: {ServiceOrderStatus.READY_TO_INVOICE},
    ServiceOrderStatus.READY_TO_INVOICE: {ServiceOrderStatus.INVOICED},
    ServiceOrderStatus.INVOICED: {ServiceOrderStatus.CLOSED},
    ServiceOrderStatus.CLOSED: set(),
}


class ServiceOrder(TenantScopedModel):
    customer = models.ForeignKey('customers.Customer', on_delete=models.CASCADE)
    unit = models.ForeignKey('units.UnitVehicle', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=50, choices=ServiceOrderStatus.choices, default=ServiceOrderStatus.DRAFT)
    internal_notes = models.TextField(blank=True)
    customer_notes = models.TextField(blank=True)
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    in_progress_at = models.DateTimeField(null=True, blank=True)
    is_comeback = models.BooleanField(default=False)

    def transition_status(self, new_status):
        allowed = ALLOWED_STATUS_TRANSITIONS.get(self.status, set())
        if new_status not in allowed:
            raise ValueError(f"Invalid transition {self.status} -> {new_status}")
        self.status = new_status
        if new_status == ServiceOrderStatus.IN_PROGRESS:
            self.in_progress_at = timezone.now()
        if new_status == ServiceOrderStatus.CLOSED:
            self.closed_at = timezone.now()
        self.save(update_fields=['status', 'in_progress_at', 'closed_at'])

    def __str__(self) -> str:
        return f"SO-{self.pk}"


class ServiceOrderLaborLine(TenantScopedModel):
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='labor_lines')
    tech = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    hours = models.DecimalField(max_digits=6, decimal_places=2)
    rate = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField()
    billed_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)


class ServiceOrderPartLine(TenantScopedModel):
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='part_lines')
    part = models.ForeignKey('parts.Part', on_delete=models.SET_NULL, null=True, blank=True)
    qty = models.PositiveIntegerField(default=1)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    taxable = models.BooleanField(default=True)


class Attachment(TenantScopedModel):
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/')
    uploaded_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
