import { Router } from 'express';
import authRoutes from './authRoutes';
import roleRoutes from './roleRoutes';
import userRoutes from './userRoutes';
import serviceRoutes from './serviceRoutes';
import zoneRoutes from './zoneRoutes';
import categoryRoutes from './categoryRoutes';
import customerRoutes from './customerRoutes';
import taskRoutes from './taskRoutes';
import invoiceRoutes from './invoiceRoutes';
import companyRoutes from './companyRoutes';
import collectorRoutes from './collectorRoutes';

const router = Router();

// Authentication routes (no auth required)
router.use('/auth', authRoutes);

// Protected routes (all require admin access)
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/zones', zoneRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);
router.use('/tasks', taskRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/company', companyRoutes);
router.use('/collectors', collectorRoutes);

export default router;
