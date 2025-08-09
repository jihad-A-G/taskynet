import { Router } from 'express';
import { createZone, getAllZones, getZoneById, updateZone, deleteZone } from '../controllers';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';

const router = Router();

// All zone routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

router.post('/', createZone);
router.get('/', getAllZones);
router.get('/:id', getZoneById);
router.put('/:id', updateZone);
router.delete('/:id', deleteZone);

export default router;
