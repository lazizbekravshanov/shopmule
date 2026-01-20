import { Router } from 'express';
import prisma from '../prisma';
import { requireRole } from '../middleware/auth';
import { Role, WorkOrderStatus } from '@prisma/client';

const router = Router();

router.post('/', requireRole([Role.ADMIN, Role.MANAGER, Role.FRONT_DESK]), async (req, res) => {
  const { vehicleId, description, checklist, notes, laborRate } = req.body;
  const workOrder = await prisma.workOrder.create({
    data: { vehicleId, description, checklist, notes, laborRate },
    include: { vehicle: true },
  });
  res.json(workOrder);
});

router.get('/', async (_req, res) => {
  const items = await prisma.workOrder.findMany({
    include: { vehicle: true, assignments: true, partsUsed: true, laborEntries: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(items);
});

router.patch('/:id/status', requireRole([Role.ADMIN, Role.MANAGER]), async (req, res) => {
  const { status } = req.body;
  if (!Object.values(WorkOrderStatus).includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const updated = await prisma.workOrder.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(updated);
});

router.post('/:id/assign', requireRole([Role.ADMIN, Role.MANAGER]), async (req, res) => {
  const { employeeId } = req.body;
  const assignment = await prisma.workOrderAssignment.create({
    data: { workOrderId: req.params.id, employeeId },
  });
  res.json(assignment);
});

router.post('/:id/labor', requireRole([Role.ADMIN, Role.MANAGER, Role.MECHANIC]), async (req, res) => {
  const { employeeId, hours, rate, note } = req.body;
  const labor = await prisma.workOrderLabor.create({
    data: { workOrderId: req.params.id, employeeId, hours, rate, note },
  });
  await prisma.workOrder.update({
    where: { id: req.params.id },
    data: { laborHours: { increment: hours } },
  });
  res.json(labor);
});

router.post('/:id/parts', requireRole([Role.ADMIN, Role.MANAGER, Role.MECHANIC]), async (req, res) => {
  const { partId, quantity, unitPrice, markupPct } = req.body;
  const part = await prisma.part.findUnique({ where: { id: partId } });
  if (!part) return res.status(404).json({ message: 'Part not found' });

  const line = await prisma.workOrderPart.create({
    data: { workOrderId: req.params.id, partId, quantity, unitPrice, markupPct },
  });
  await prisma.workOrder.update({
    where: { id: req.params.id },
    data: { partsTotal: { increment: quantity * unitPrice * (1 + (markupPct ?? 0.15)) } },
  });
  await prisma.part.update({
    where: { id: partId },
    data: { stock: { decrement: quantity } },
  });
  res.json(line);
});

export default router;

