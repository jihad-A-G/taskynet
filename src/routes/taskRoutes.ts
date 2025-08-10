import { Router } from 'express';
import { createTask, getAllTasks, getTaskById, updateTask, deleteTask } from '../controllers';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';

const router = Router();

// All task routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               priority:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               description:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', createTask);
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAllTasks);
/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Admin]
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
 *         description: Task details
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', getTaskById);
/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update task by ID
 *     tags: [Admin]
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
 *               assignedTo:
 *                 type: string
 *               priority:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               description:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task updated
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', updateTask);
/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete task by ID
 *     tags: [Admin]
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
 *         description: Task deleted
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', deleteTask);

export default router;
