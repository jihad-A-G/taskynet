import express from 'express';
import {
  login,
  getTasks,
  acceptTask,
  updateTaskStage,
  cancelTask,
  getOngoingTasks,
  getInvoices,
  payInvoice,
  getProfile,
  changePassword,
  addTaskComment
} from '../controllers/employeeController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /employee/login:
 *   post:
 *     summary: Employee login
 *     tags: [Employee]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

// All other endpoints require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /employee/tasks:
 *   get:
 *     summary: Get tasks assigned to the employee
 *     tags: [Employee]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by task number or customer name
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
router.get('/tasks', getTasks);
/**
 * @swagger
 * /employee/tasks/{id}/accept:
 *   post:
 *     summary: Accept a task (only one active task at a time)
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task accepted
 *       400:
 *         description: Already have an active task
 *       401:
 *         description: Unauthorized
 */
router.post('/tasks/:id/accept', acceptTask);
/**
 * @swagger
 * /employee/tasks/{id}/update-stage:
 *   post:
 *     summary: Update task stage (accepted → arrived → completed)
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task stage updated
 *       400:
 *         description: Cannot update stage further
 *       401:
 *         description: Unauthorized
 */
router.post('/tasks/:id/update-stage', updateTaskStage);
/**
 * @swagger
 * /employee/tasks/{id}/cancel:
 *   post:
 *     summary: Cancel a task
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task cancelled
 *       401:
 *         description: Unauthorized
 */
router.post('/tasks/:id/cancel', cancelTask);
/**
 * @swagger
 * /employee/tasks/ongoing:
 *   get:
 *     summary: Get ongoing tasks (not completed)
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ongoing tasks
 *       401:
 *         description: Unauthorized
 */
router.get('/tasks/ongoing', getOngoingTasks);
/**
 * @swagger
 * /employee/invoices:
 *   get:
 *     summary: Get invoices assigned to collector
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 *       401:
 *         description: Unauthorized
 */
router.get('/invoices', getInvoices);
/**
 * @swagger
 * /employee/invoices/{id}/pay:
 *   post:
 *     summary: Pay invoice (partial or full)
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice payment recorded
 *       401:
 *         description: Unauthorized
 */
router.post('/invoices/:id/pay', payInvoice);
/**
 * @swagger
 * /employee/profile:
 *   get:
 *     summary: Get employee profile
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', getProfile);
/**
 * @swagger
 * /employee/change-password:
 *   post:
 *     summary: Change employee password
 *     tags: [Employee]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Old password incorrect
 *       401:
 *         description: Unauthorized
 */
router.post('/change-password', changePassword);
/**
 * @swagger
 * /employee/tasks/{id}/comment:
 *   post:
 *     summary: Add comment to a task and notify admin (real-time)
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comment added and sent to admin
 *       401:
 *         description: Unauthorized
 */
router.post('/tasks/:id/comment', addTaskComment);

export default router;
