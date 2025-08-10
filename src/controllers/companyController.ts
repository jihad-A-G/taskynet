import { Request, Response } from 'express';
import { Company } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

export const getCompanyInfo = async (req: Request, res: Response) => {
  try {
    const company = await (Company as any).getInstance();
    return res.json(company);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const cashout = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, reason } = req.body;
    const performedBy = req.user._id; // Assuming user is attached by auth middleware
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Cashout amount must be greater than 0' });
    }
    
    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({ error: 'Cashout reason is required and must be at least 3 characters' });
    }
    
    const company = await (Company as any).getInstance();
    
    if (amount > company.cash) {
      return res.status(400).json({ error: 'Insufficient cash for cashout' });
    }
    
    await company.cashout(amount, reason, performedBy);
    
    return res.json({
      message: `Cashout of $${amount} processed successfully`,
      remainingCash: company.cash,
      transaction: {
        amount,
        reason,
        performedBy,
        createdAt: new Date()
      }
    });
    
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getCashoutHistory = async (req: Request, res: Response) => {
  try {
    const { limit = 50 } = req.query;
    const company = await (Company as any).getInstance();
    
    const transactions = company.getRecentCashouts(Number(limit));
    
    return res.json({
      transactions,
      totalCashouts: company.getTotalCashouts(),
      currentCash: company.cash
    });
    
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCashoutsByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const company = await (Company as any).getInstance();
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    const transactions = company.getCashoutsByDateRange(start, end);
    const totalAmount = transactions.reduce((sum: number, transaction: any) => sum + transaction.amount, 0);
    
    return res.json({
      transactions,
      totalAmount,
      dateRange: { startDate, endDate },
      count: transactions.length
    });
    
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
