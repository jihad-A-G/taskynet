import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Invoice, Customer, Service, User } from '../models';

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = new Invoice(req.body);
    const savedInvoice = await invoice.save();
    return res.status(201).json(savedInvoice);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await Invoice.find();
    return res.json(invoices);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    return res.json(invoice);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    return res.json(invoice);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    return res.json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const generateMonthlyInvoices = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }
    
    // Get all active customers
    const customers = await Customer.find({ isActive: true }).populate(['serviceId', 'zoneId']);
    
    if (customers.length === 0) {
      return res.status(404).json({ error: 'No active customers found' });
    }
    
    // Get all collectors for assignment
    const collectors = await User.find({ isActive: true }).populate({
      path: 'roleId',
      match: { name: 'Collector' }
    });
    
    const validCollectors = collectors.filter(user => user.roleId);
    
    if (validCollectors.length === 0) {
      return res.status(404).json({ error: 'No active collectors found' });
    }
    
    // Check if invoices already exist for this month
    const existingInvoices = await Invoice.findByMonth(year as number, month as number);
    if (existingInvoices.length > 0) {
      return res.status(400).json({ 
        error: `Invoices for ${year}-${String(month).padStart(2, '0')} already exist` 
      });
    }
    
    const invoices = [];
    const dueDate = new Date(year, month, 15); // Due on 15th of next month
    
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i]!;
      const collector = validCollectors[i % validCollectors.length]!; // Round-robin assignment
      
      const invoice = new Invoice({
        customerId: customer._id,
        serviceId: (customer.serviceId as any)._id,
        balance: (customer.serviceId as any).cost,
        dueDate: dueDate,
        assignedTo: collector._id
      });
      
      const savedInvoice = await invoice.save();
      invoices.push(savedInvoice);
    }
    
    return res.status(201).json({
      message: `Successfully generated ${invoices.length} invoices for ${year}-${String(month).padStart(2, '0')}`,
      count: invoices.length,
      invoices: invoices
    });
    
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const applyDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { discount } = req.body;
    
    if (discount === undefined || discount < 0 || discount > 100) {
      return res.status(400).json({ error: 'Discount must be between 0 and 100 percent' });
    }
    
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    await invoice.applyDiscount(discount);
    
    return res.json({
      message: `Discount of ${discount}% applied successfully`,
      invoice: invoice
    });
    
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const removeDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    await invoice.removeDiscount();
    
    return res.json({
      message: 'Discount removed successfully',
      invoice: invoice
    });
    
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const makePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Payment amount must be greater than 0' });
    }
    
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    await invoice.makePayment(amount);
    
    return res.json({
      message: `Payment of $${amount} recorded successfully`,
      invoice: invoice,
      remainingBalance: invoice.getRemainingBalance()
    });
    
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getInvoicesByCollector = async (req: Request, res: Response) => {
  try {
    const { collectorId } = req.params;
    
    if (!collectorId) {
      return res.status(400).json({ error: 'Collector ID is required' });
    }
    
    const invoices = await Invoice.findByCollector(new mongoose.Types.ObjectId(collectorId));
    return res.json(invoices);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getInvoicesByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const invoices = await Invoice.findByStatus(status as any);
    return res.json(invoices);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getOverdueInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await Invoice.findOverdue();
    return res.json(invoices);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
