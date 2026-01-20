import { Router } from 'express';
import prisma from '../prisma';
import { requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.post('/clock-in', requireRole([Role.ADMIN, Role.MANAGER, Role.MECHANIC]), async (req, res) => {
  const { employeeId, jobId } = req.body;
  const entry = await prisma.timeEntry.create({
    data: { employeeId, jobId, clockIn: new Date() },
  });
  res.json(entry);
});

router.post('/clock-out/:id', requireRole([Role.ADMIN, Role.MANAGER, Role.MECHANIC]), async (req, res) => {
  const entry = await prisma.timeEntry.update({
    where: { id: req.params.id },
    data: { clockOut: new Date() },
  });
  res.json(entry);
});

router.get('/timesheet/:employeeId', async (req, res) => {
  const entries = await prisma.timeEntry.findMany({
    where: { employeeId: req.params.employeeId },
    orderBy: { clockIn: 'desc' },
  });
  res.json(entries);
});

export default router;

