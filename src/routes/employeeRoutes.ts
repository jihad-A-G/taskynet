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
 * tags:
 *   - name: Employee Auth
 *     description: Authentication for mobile employees
 *   - name: Employee Tasks
 *     description: Task management for employees (technicians)
 *   - name: Employee Invoices
 *     description: Invoice collection for collectors
 *   - name: Employee Profile
 *     description: Employee profile management
 */

/**
 * @swagger
 * /employee/login:
 *   post:
 *     summary: Employee login (technicians, collectors)
 *     tags: [Employee Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     roleId:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', login);

// All other endpoints require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /employee/tasks:
 *   get:
 *     summary: Get tasks assigned to the employee
 *     tags: [Employee Tasks]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by task number or customer name
 *         example: "12345"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   taskNumber:
 *                     type: number
 *                   customerId:
 *                     type: object
 *                   stage:
 *                     type: string
 *                     enum: [pending, assigned, accepted, in_progress, arrived, completed, cancelled]
 *                   priority:
 *                     type: string
 *                     enum: [low, medium, high, urgent]
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/tasks', getTasks);

/**
 * @swagger
 * /employee/tasks/{id}/accept:
 *   post:
 *     summary: Accept a task (only one active task at a time)
 *     tags: [Employee Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *         example: "60d0fe4f5311236168a109ca"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 stage:
 *                   type: string
 *                   example: "accepted"
 *       400:
 *         description: Already have an active task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Task not found or not assigned to you
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/tasks/:id/accept', acceptTask);

/**
 * @swagger
 * /employee/tasks/{id}/update-stage:
 *   post:
 *     summary: Update task stage (accepted → arrived → completed)
 *     tags: [Employee Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *         example: "60d0fe4f5311236168a109ca"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task stage updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 stage:
 *                   type: string
 *                   example: "arrived"
 *       400:
 *         description: Cannot update stage further
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/tasks/:id/update-stage', updateTaskStage);

/**
 * @swagger
 * /employee/tasks/{id}/cancel:
 *   post:
 *     summary: Cancel a task
 *     tags: [Employee Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *         example: "60d0fe4f5311236168a109ca"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 stage:
 *                   type: string
 *                   example: "cancelled"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/tasks/:id/cancel', cancelTask);

/**
 * @swagger
 * /employee/tasks/ongoing:
 *   get:
 *     summary: Get ongoing tasks (not completed)
 *     tags: [Employee Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ongoing tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   taskNumber:
 *                     type: number
 *                   stage:
 *                     type: string
 *                     enum: [accepted, assigned, in_progress]
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/tasks/ongoing', getOngoingTasks);

/**
 * @swagger
 * /employee/invoices:
 *   get:
 *     summary: Get invoices assigned to collector
 *     tags: [Employee Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices to collect
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   number:
 *                     type: string
 *                     example: "INV-202501-0001"
 *                   customerId:
 *                     type: object
 *                   balance:
 *                     type: number
 *                   amount:
 *                     type: number
 *                   status:
 *                     type: string
 *                     enum: [unpaid, paid, partially_paid]
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized (not a collector)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/invoices', getInvoices);

/**
 * @swagger
 * /employee/invoices/{id}/pay:
 *   post:
 *     summary: Record payment for invoice (partial or full)
 *     tags: [Employee Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *         example: "60d0fe4f5311236168a109ca"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentRequest'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [paid, partially_paid]
 *                 amount:
 *                   type: number
 *       400:
 *         description: Invalid payment amount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/invoices/:id/pay', payInvoice);

/**
 * @swagger
 * /employee/profile:
 *   get:
 *     summary: Get employee profile information
 *     tags: [Employee Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 roleId:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /employee/change-password:
 *   post:
 *     summary: Change employee password
 *     tags: [Employee Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Old password incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/change-password', changePassword);

/**
 * @swagger
 * /employee/tasks/{id}/comment:
 *   post:
 *     summary: Add comment to a task and notify admin (real-time)
 *     tags: [Employee Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *         example: "60d0fe4f5311236168a109ca"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentRequest'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comment added and sent to admin
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     task:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
