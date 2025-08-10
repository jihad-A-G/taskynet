import express from 'express';
import {
  getCollectors,
  getCollectorAssignments,
  updateCollectorAssignments,
  receiveFromCollector,
  payToCollector,
  getCollectorTransactions
} from '../controllers/collectorController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireRole('Admin'));

// GET /api/collectors - Get all collectors with balances
router.get('/', getCollectors);

// GET /api/collectors/:collectorId/assignments - Get collector assignments
router.get('/:collectorId/assignments', getCollectorAssignments);

// PUT /api/collectors/:collectorId/assignments - Update collector assignments
router.put('/:collectorId/assignments', updateCollectorAssignments);

// POST /api/collectors/:collectorId/receive - Record money received from collector
router.post('/:collectorId/receive', receiveFromCollector);

// POST /api/collectors/:collectorId/pay - Pay money to collector
router.post('/:collectorId/pay', payToCollector);

// GET /api/collectors/:collectorId/transactions - Get collector transaction history
router.get('/:collectorId/transactions', getCollectorTransactions);

// GET /api/collectors/transactions - Get all collector transactions
router.get('/transactions', getCollectorTransactions);

export default router;
