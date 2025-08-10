import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User, Invoice, CollectorBalance, CollectorTransaction } from '../models';
import { TransactionType } from '../models/CollectorTransaction';

export const getCollectors = async (req: Request, res: Response) => {
  try {
    // Get all users with Collector role
    const collectors = await User.find({ isActive: true }).populate({
      path: 'roleId',
      match: { name: 'Collector' }
    });
    
    const validCollectors = collectors.filter(user => user.roleId);
    
    // Get balances for each collector
    const collectorsWithBalances = await Promise.all(
      validCollectors.map(async (collector) => {
        const balance = await CollectorBalance.findOne({ collectorId: collector._id }) || 
                       { balanceLBP: 0, balanceUSD: 0 };
        
        return {
          _id: collector._id,
          firstName: collector.firstName,
          lastName: collector.lastName,
          email: collector.email,
          phoneNumber: collector.phoneNumber,
          balanceLBP: balance.balanceLBP,
          balanceUSD: balance.balanceUSD
        };
      })
    );
    
    return res.json(collectorsWithBalances);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCollectorAssignments = async (req: Request, res: Response) => {
  try {
    const { collectorId } = req.params;
    
    if (!collectorId) {
      return res.status(400).json({ error: 'Collector ID is required' });
    }

    // Get all customers
    const allCustomers = await mongoose.model('Customer').find({ isActive: true });
    
    // Get assigned customers (customers with unpaid invoices assigned to this collector)
    const assignedInvoices = await Invoice.find({
      assignedTo: new mongoose.Types.ObjectId(collectorId),
      status: { $ne: 'paid' }
    }).populate('customerId');
    
    const assignedCustomers = assignedInvoices.map(invoice => invoice.customerId);
    const assignedCustomerIds = assignedCustomers.map(customer => (customer as any)._id.toString());
    
    // Get unassigned customers
    const unassignedCustomers = allCustomers.filter(
      customer => !assignedCustomerIds.includes(customer._id.toString())
    );
    
    return res.json({
      allCustomers,
      assignedCustomers,
      unassignedCustomers
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCollectorAssignments = async (req: Request, res: Response) => {
  try {
    const { collectorId } = req.params;
    const { assignedCustomerIds } = req.body; // Array of customer IDs to assign
    
    if (!collectorId) {
      return res.status(400).json({ error: 'Collector ID is required' });
    }
    
    if (!Array.isArray(assignedCustomerIds)) {
      return res.status(400).json({ error: 'Assigned customer IDs must be an array' });
    }
    
    // Update all unpaid invoices: remove this collector from all customers first
    await Invoice.updateMany(
      { 
        assignedTo: new mongoose.Types.ObjectId(collectorId),
        status: { $ne: 'paid' }
      },
      { $unset: { assignedTo: 1 } }
    );
    
    // Assign the collector to the specified customers' unpaid invoices
    if (assignedCustomerIds.length > 0) {
      const customerObjectIds = assignedCustomerIds.map(id => new mongoose.Types.ObjectId(id));
      
      await Invoice.updateMany(
        {
          customerId: { $in: customerObjectIds },
          status: { $ne: 'paid' }
        },
        { assignedTo: new mongoose.Types.ObjectId(collectorId) }
      );
    }
    
    return res.json({ 
      message: 'Collector assignments updated successfully',
      assignedCustomers: assignedCustomerIds.length
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const receiveFromCollector = async (req: Request, res: Response) => {
  try {
    const { collectorId } = req.params;
    const { amount, currency, description } = req.body;
    const adminId = (req as any).user.id; // From auth middleware
    
    if (!collectorId || !amount || !currency) {
      return res.status(400).json({ 
        error: 'Collector ID, amount, and currency are required' 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    
    if (!['LBP', 'USD'].includes(currency)) {
      return res.status(400).json({ error: 'Currency must be LBP or USD' });
    }
    
    // Create transaction record
    const transaction = new CollectorTransaction({
      collectorId: new mongoose.Types.ObjectId(collectorId),
      amount,
      currency,
      type: TransactionType.RECEIVED,
      description,
      processedBy: new mongoose.Types.ObjectId(adminId)
    });
    
    await transaction.save();
    
    // Update collector balance (subtract from collector, add to company)
    await CollectorBalance.updateBalance(
      new mongoose.Types.ObjectId(collectorId),
      amount,
      currency,
      'subtract'
    );
    
    // Update company cash (add received amount)
    const Company = mongoose.model('Company');
    const company = await Company.findOne() || new Company();
    
    if (currency === 'LBP') {
      company.cash += amount;
    } else {
      // Convert USD to LBP for company cash (you might want to use a dynamic exchange rate)
      const exchangeRate = 90000; // Example rate, should be configurable
      company.cash += amount * exchangeRate;
    }
    
    await company.save();
    
    return res.json({
      message: `Successfully received ${amount} ${currency} from collector`,
      transaction,
      newCompanyCash: company.cash
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const payToCollector = async (req: Request, res: Response) => {
  try {
    const { collectorId } = req.params;
    const { amount, currency, description } = req.body;
    const adminId = (req as any).user.id; // From auth middleware
    
    if (!collectorId || !amount || !currency) {
      return res.status(400).json({ 
        error: 'Collector ID, amount, and currency are required' 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    
    if (!['LBP', 'USD'].includes(currency)) {
      return res.status(400).json({ error: 'Currency must be LBP or USD' });
    }
    
    // Check company cash
    const Company = mongoose.model('Company');
    const company = await Company.findOne() || new Company();
    
    let requiredCash = amount;
    if (currency === 'USD') {
      const exchangeRate = 90000; // Example rate
      requiredCash = amount * exchangeRate;
    }
    
    if (company.cash < requiredCash) {
      return res.status(400).json({ 
        error: 'Insufficient company cash for this payment' 
      });
    }
    
    // Create transaction record
    const transaction = new CollectorTransaction({
      collectorId: new mongoose.Types.ObjectId(collectorId),
      amount,
      currency,
      type: TransactionType.PAID,
      description,
      processedBy: new mongoose.Types.ObjectId(adminId)
    });
    
    await transaction.save();
    
    // Update collector balance (add to collector)
    await CollectorBalance.updateBalance(
      new mongoose.Types.ObjectId(collectorId),
      amount,
      currency,
      'add'
    );
    
    // Update company cash (subtract paid amount)
    company.cash -= requiredCash;
    await company.save();
    
    return res.json({
      message: `Successfully paid ${amount} ${currency} to collector`,
      transaction,
      newCompanyCash: company.cash
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCollectorTransactions = async (req: Request, res: Response) => {
  try {
    const { collectorId } = req.params;
    const { startDate, endDate, type } = req.query;
    
    const query: any = {};
    
    if (collectorId) {
      query.collectorId = new mongoose.Types.ObjectId(collectorId);
    }
    
    if (type && ['received', 'paid'].includes(type as string)) {
      query.type = type;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const transactions = await CollectorTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
    
    return res.json(transactions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
