import { Router } from 'express';
import prisma from '../prisma';
import { requireRole } from '../middleware/auth';
import { Role, PaymentStatus } from '@prisma/client';

const router = Router();

router.post('/', requireRole([Role.ADMIN, Role.MANAGER, Role.FRONT_DESK]), async (req, res) => {
  const { workOrderId, taxRate = 0.07, discount = 0 } = req.body;
  const workOrder = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: { vehicle: { include: { customer: true } } },
  });
  if (!workOrder) return res.status(404).json({ message: 'Work order not found' });
  const subtotalLabor = workOrder.laborHours * workOrder.laborRate;
  const subtotalParts = workOrder.partsTotal;
  const tax = (subtotalLabor + subtotalParts - discount) * taxRate;
  const total = subtotalLabor + subtotalParts + tax - discount;

  const invoice = await prisma.invoice.create({
    data: {
      workOrderId,
      customerId: workOrder.vehicle.customerId,
      subtotalParts,
      subtotalLabor,
      tax,
      discount,
      total,
    },
  });
  res.json(invoice);
});

router.get('/', async (_req, res) => {
  const invoices = await prisma.invoice.findMany({ include: { customer: true, workOrder: true } });
  res.json(invoices);
});

router.post('/:id/pay', requireRole([Role.ADMIN, Role.MANAGER, Role.FRONT_DESK]), async (req, res) => {
  const { amount, method } = req.body;
  const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  await prisma.payment.create({
    data: { invoiceId: invoice.id, amount, method },
  });
  const payments = await prisma.payment.aggregate({
    where: { invoiceId: invoice.id },
    _sum: { amount: true },
  });
  const paid = payments._sum.amount || 0;
  const status: PaymentStatus =
    paid === 0 ? PaymentStatus.UNPAID : paid < invoice.total ? PaymentStatus.PARTIAL : PaymentStatus.PAID;
  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: { status },
  });
  res.json(updated);
});

export default router;

