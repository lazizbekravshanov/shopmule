import { Router } from 'express';
import prisma from '../prisma';
import { requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', async (_req, res) => {
  const parts = await prisma.part.findMany({ include: { vendor: true } });
  res.json(parts);
});

router.post('/', requireRole([Role.ADMIN, Role.MANAGER]), async (req, res) => {
  const { sku, name, category, cost, price, stock, reorderPoint, vendorId } = req.body;
  const part = await prisma.part.create({
    data: { sku, name, category, cost, price, stock, reorderPoint, vendorId },
  });
  res.json(part);
});

router.patch('/:id/adjust', requireRole([Role.ADMIN, Role.MANAGER]), async (req, res) => {
  const { delta } = req.body;
  const part = await prisma.part.update({
    where: { id: req.params.id },
    data: { stock: { increment: delta } },
  });
  res.json(part);
});

router.get('/low-stock', async (_req, res) => {
  const parts = await prisma.part.findMany();
  const low = parts.filter((p) => p.reorderPoint > 0 && p.stock <= p.reorderPoint);
  res.json(low);
});

export default router;

