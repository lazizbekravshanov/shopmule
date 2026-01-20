import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/revenue', async (req, res) => {
  const { from, to } = req.query;
  const start = from ? new Date(from as string) : new Date('1970-01-01');
  const end = to ? new Date(to as string) : new Date();
  const invoices = await prisma.invoice.findMany({
    where: { createdAt: { gte: start, lte: end } },
  });
  const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
  res.json({ total, count: invoices.length });
});

router.get('/productivity/:employeeId', async (req, res) => {
  const labor = await prisma.workOrderLabor.aggregate({
    where: { employeeId: req.params.employeeId },
    _sum: { hours: true },
  });
  res.json({ hours: labor._sum.hours || 0 });
});

router.get('/payroll/:employeeId', async (req, res) => {
  const employee = await prisma.employeeProfile.findUnique({ where: { id: req.params.employeeId } });
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  const entries = await prisma.timeEntry.findMany({
    where: { employeeId: employee.id, clockOut: { not: null } },
  });
  const hours = entries.reduce((sum, e) => {
    if (!e.clockOut) return sum;
    const diffMs = new Date(e.clockOut).getTime() - new Date(e.clockIn).getTime();
    return sum + diffMs / (1000 * 60 * 60);
  }, 0);
  res.json({ hours, payRate: employee.payRate, estimatedGross: hours * employee.payRate });
});

export default router;

