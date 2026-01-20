import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { authenticate } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import workOrderRoutes from './routes/workOrders';
import inventoryRoutes from './routes/inventory';
import invoiceRoutes from './routes/invoices';
import timeRoutes from './routes/time';
import reportRoutes from './routes/reports';
import employeeRoutes from './routes/employees';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/customers', authenticate, customerRoutes);
app.use('/api/work-orders', authenticate, workOrderRoutes);
app.use('/api/inventory', authenticate, inventoryRoutes);
app.use('/api/invoices', authenticate, invoiceRoutes);
app.use('/api/time', authenticate, timeRoutes);
app.use('/api/reports', authenticate, reportRoutes);
app.use('/api/employees', authenticate, employeeRoutes);

app.use(errorHandler);

export default app;

