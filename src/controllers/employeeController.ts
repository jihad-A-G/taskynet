import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Task, Invoice } from '../models';
import { InvoiceStatus } from '../models/Invoice';
import { TaskStage } from '../models/Task';
import { io } from '../index'; 

// Helper: get user from JWT
const getUserFromRequest = async (req: Request) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new Error('User not authenticated');
  return await User.findById(userId);
};

// 1. Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.roleId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return res.json({ token, user });
};

// 2. View user tasks (search)
export const getTasks = async (req: Request, res: Response) => {
  const user = await getUserFromRequest(req);
  const { search } = req.query;
  let query: any = { assignedTo: user?._id };
  if (search) {
    if (!isNaN(Number(search))) query.taskNumber = Number(search);
    else {
      // Search by customer name
      const customers = await mongoose.model('Customer').find({ name: new RegExp(search as string, 'i') });
      query.customerId = { $in: customers.map((c: any) => c._id) };
    }
  }
  const tasks = await Task.find(query).sort({ createdAt: -1 });
  res.json(tasks);
};

// 3. Accept task
export const acceptTask = async (req: Request, res: Response) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'User not authenticated' });
  const { id } = req.params;
  // Only one active task at a time
  const ongoing = await Task.findOne({ assignedTo: user._id, stage: { $in: [TaskStage.ASSIGNED, TaskStage.IN_PROGRESS, TaskStage.ACCEPTED] } });
  if (ongoing) return res.status(400).json({ error: 'You already have an active task' });
  const task = await Task.findById(id);
  if (!task || String(task.assignedTo) !== String(user._id)) return res.status(404).json({ error: 'Task not found or not assigned to you' });
  task.stage = TaskStage.ACCEPTED;
  await task.save();
  return res.json(task);
};

// 4. Update stage
export const updateTaskStage = async (req: Request, res: Response) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'User not authenticated' });
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task || String(task.assignedTo) !== String(user._id)) return res.status(404).json({ error: 'Task not found or not assigned to you' });
  if (task.stage === TaskStage.ACCEPTED) task.stage = TaskStage.ARRIVED;
  else if (task.stage === TaskStage.ARRIVED) task.stage = TaskStage.COMPLETED;
  else return res.status(400).json({ error: 'Cannot update stage further' });
  await task.save();
  return res.json(task);
};

// 5. Cancel task
export const cancelTask = async (req: Request, res: Response) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'User not authenticated' });
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task || String(task.assignedTo) !== String(user._id)) return res.status(404).json({ error: 'Task not found or not assigned to you' });
  task.stage = TaskStage.CANCELLED;
  await task.save();
  return res.json(task);
};

// 6. View ongoing tasks
export const getOngoingTasks = async (req: Request, res: Response) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'User not authenticated' });
  const tasks = await Task.find({ assignedTo: user._id, stage: { $in: [TaskStage.ACCEPTED, TaskStage.ASSIGNED, TaskStage.IN_PROGRESS] } });
  return res.json(tasks);
};

// 7. View invoices (for collector)
export const getInvoices = async (req: Request, res: Response) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'User not authenticated' });
  // Only for collectors
  const role = await mongoose.model('Role').findById(user.roleId);
  if (!role || role.name !== 'Collector') return res.status(403).json({ error: 'Not authorized' });
  const invoices = await Invoice.find({ assignedTo: user._id, status: { $in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] } });
  return res.json(invoices);
};

// 8. Pay invoice
export const payInvoice = async (req: Request, res: Response) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'User not authenticated' });
  const { id } = req.params;
  const { amount } = req.body;
  const invoice = await Invoice.findById(id);
  if (!invoice || String(invoice.assignedTo) !== String(user._id)) return res.status(404).json({ error: 'Invoice not found or not assigned to you' });
  await invoice.makePayment(amount);
  return res.json(invoice);
};

// 9. View profile
export const getProfile = async (req: Request, res: Response) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'User not authenticated' });
  return res.json(user);
};

// 10. Change password
export const changePassword = async (req: Request, res: Response) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'User not authenticated' });
  const { oldPassword, newPassword } = req.body;
  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) return res.status(400).json({ error: 'Old password incorrect' });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return res.json({ message: 'Password changed successfully' });
};

// 11. Add comment on task + socket event
export const addTaskComment = async (req: Request, res: Response) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'User not authenticated' });
  const { id } = req.params;
  const { message } = req.body;
  const task = await Task.findById(id);
  if (!task || String(task.assignedTo) !== String(user._id)) return res.status(404).json({ error: 'Task not found or not assigned to you' });
  task.comments.push({ userId: user._id as mongoose.Types.ObjectId, message, createdAt: new Date() });
  await task.save();
  // Emit socket event to admin (replace with actual socket instance)
  io.emit('task:comment', { taskId: id, userId: user._id, message });
  return res.json({ message: 'Comment added and sent to admin', task });
};
