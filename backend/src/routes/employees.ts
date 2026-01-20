import { Router } from 'express';
import prisma from '../prisma';
import { requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();

router.get('/', requireRole([Role.ADMIN, Role.MANAGER]), async (_req, res) => {
  const employees = await prisma.employeeProfile.findMany({
    include: { user: true },
  });
  res.json(employees);
});

router.post('/', requireRole([Role.ADMIN, Role.MANAGER]), async (req, res) => {
  const { name, role, payRate, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const employee = await prisma.employeeProfile.create({
    data: {
      name,
      role,
      payRate,
      user: {
        create: {
          email,
          passwordHash: hash,
          role,
        },
      },
    },
    include: { user: true },
  });
  res.json(employee);
});

export default router;

