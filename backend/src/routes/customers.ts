import { Router } from 'express';
import prisma from '../prisma';
import { requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Create customer with optional vehicles
router.post('/', requireRole([Role.ADMIN, Role.MANAGER, Role.FRONT_DESK]), async (req, res) => {
  const { name, contactName, phone, email, billingAddress, vehicles } = req.body;
  const customer = await prisma.customer.create({
    data: {
      name,
      contactName,
      phone,
      email,
      billingAddress,
      vehicles: {
        create: vehicles?.map((v: any) => ({
          vin: v.vin,
          unitNumber: v.unitNumber,
          make: v.make,
          model: v.model,
          year: v.year,
          mileage: v.mileage,
          licensePlate: v.licensePlate,
        })) || [],
      },
    },
    include: { vehicles: true },
  });
  res.json(customer);
});

router.get('/', async (_req, res) => {
  const customers = await prisma.customer.findMany({
    include: { vehicles: true },
    orderBy: { name: 'asc' },
  });
  res.json(customers);
});

router.get('/:id', async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: { vehicles: true, invoices: true },
  });
  if (!customer) return res.status(404).json({ message: 'Not found' });
  res.json(customer);
});

router.post('/:id/vehicles', requireRole([Role.ADMIN, Role.MANAGER, Role.FRONT_DESK]), async (req, res) => {
  const { vin, unitNumber, make, model, year, mileage, licensePlate } = req.body;
  const vehicle = await prisma.vehicle.create({
    data: { vin, unitNumber, make, model, year, mileage, licensePlate, customerId: req.params.id },
  });
  res.json(vehicle);
});

export default router;

