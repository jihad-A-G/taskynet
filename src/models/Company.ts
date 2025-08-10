import mongoose, { Document, Schema } from 'mongoose';

export interface ICashoutTransaction {
  amount: number;
  reason: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ICompany extends Document {
  cash: number;
  cashoutTransactions: ICashoutTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const cashoutTransactionSchema: Schema = new Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Cashout amount is required'],
      min: [0.01, 'Cashout amount must be greater than 0']
    },
    reason: {
      type: String,
      required: [true, 'Cashout reason is required'],
      trim: true,
      minlength: [3, 'Reason must be at least 3 characters long'],
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User who performed cashout is required']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: true,
    versionKey: false
  }
);

const companySchema: Schema = new Schema(
  {
    cash: {
      type: Number,
      default: 0,
      min: [0, 'Cash cannot be negative'],
      required: [true, 'Cash amount is required']
    },
    cashoutTransactions: [cashoutTransactionSchema]
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Index for better query performance
companySchema.index({ 'cashoutTransactions.createdAt': -1 });

// Static method to get or create company instance (singleton pattern)
companySchema.statics.getInstance = async function () {
  let company = await this.findOne();
  if (!company) {
    // Initialize cash with sum of all paid invoices
    const Invoice = mongoose.model('Invoice');
    const paidInvoices = await Invoice.find({ status: 'paid' });
    const totalCash = paidInvoices.reduce((sum, invoice) => {
      const finalBalance = invoice.balance - (invoice.balance * invoice.discount / 100);
      return sum + finalBalance;
    }, 0);
    
    company = new this({ cash: totalCash });
    await company.save();
  }
  return company;
};

// Instance method to add cash (when invoice is paid)
companySchema.methods.addCash = function (amount: number) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  this.cash += amount;
  return this.save();
};

// Instance method to cashout
companySchema.methods.cashout = function (amount: number, reason: string, performedBy: mongoose.Types.ObjectId) {
  if (amount <= 0) {
    throw new Error('Cashout amount must be greater than 0');
  }
  
  if (amount > this.cash) {
    throw new Error('Insufficient cash for cashout');
  }
  
  if (!reason || reason.trim().length < 3) {
    throw new Error('Cashout reason is required and must be at least 3 characters');
  }
  
  this.cash -= amount;
  this.cashoutTransactions.push({
    amount,
    reason: reason.trim(),
    performedBy,
    createdAt: new Date()
  });
  
  return this.save();
};

// Instance method to get total cashouts
companySchema.methods.getTotalCashouts = function () {
  return this.cashoutTransactions.reduce((sum: number, transaction: ICashoutTransaction) => {
    return sum + transaction.amount;
  }, 0);
};

// Instance method to get cashouts by date range
companySchema.methods.getCashoutsByDateRange = function (startDate: Date, endDate: Date) {
  return this.cashoutTransactions.filter((transaction: ICashoutTransaction) => {
    return transaction.createdAt >= startDate && transaction.createdAt <= endDate;
  });
};

// Instance method to get recent cashouts
companySchema.methods.getRecentCashouts = function (limit: number = 10) {
  return this.cashoutTransactions
    .sort((a: ICashoutTransaction, b: ICashoutTransaction) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
};

const Company = mongoose.model<ICompany>('Company', companySchema);
export default Company;
