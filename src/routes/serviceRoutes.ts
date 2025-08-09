import { Router } from 'express';
import { createService, getAllServices, getServiceById, updateService, deleteService } from '../controllers';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';

const router = Router();

// All service routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

router.post('/', createService);
router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
