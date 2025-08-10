import { Router } from 'express';
import { 
  createInvoice, 
  getAllInvoices, 
  getInvoiceById, 
  updateInvoice, 
  deleteInvoice,
  generateMonthlyInvoices,
  applyDiscount,
  removeDiscount,
  makePayment,
  getInvoicesByCollector,
  getInvoicesByStatus,
  getOverdueInvoices
} from '../controllers/invoiceController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';

const router = Router();

// All invoice routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// CRUD operations
router.post('/', createInvoice);
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

// Special operations
router.post('/generate-monthly', generateMonthlyInvoices);
router.post('/:id/apply-discount', applyDiscount);
router.post('/:id/remove-discount', removeDiscount);
router.post('/:id/payment', makePayment);

// Query operations
router.get('/collector/:collectorId', getInvoicesByCollector);
router.get('/status/:status', getInvoicesByStatus);
router.get('/overdue/list', getOverdueInvoices);

export default router;
