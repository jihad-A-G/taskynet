import { Router } from 'express';
import { 
  getCompanyInfo,
  cashout,
  getCashoutHistory,
  getCashoutsByDateRange
} from '../controllers/companyController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';

const router = Router();

// All company routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getCompanyInfo);
router.post('/cashout', cashout);
router.get('/cashout-history', getCashoutHistory);
router.get('/cashout-by-date', getCashoutsByDateRange);

export default router;
