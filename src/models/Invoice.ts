import mongoose, { Document, Schema } from 'mongoose';

export enum InvoiceStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid'
}

export interface IInvoice extends Document {
  number: string;
  customerId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  discount: number;
  dueDate: Date;
  assignedTo: mongoose.Types.ObjectId;
  balance: number;
  amount: number;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  applyDiscount(discountPercentage: number): Promise<IInvoice>;
  removeDiscount(): Promise<IInvoice>;
  makePayment(paymentAmount: number): Promise<IInvoice>;
  getRemainingBalance(): number;
}

export interface IInvoiceModel extends mongoose.Model<IInvoice> {
  findByStatus(status: InvoiceStatus): mongoose.Query<IInvoice[], IInvoice>;
  findByCollector(collectorId: mongoose.Types.ObjectId): mongoose.Query<IInvoice[], IInvoice>;
  findByCustomer(customerId: mongoose.Types.ObjectId): mongoose.Query<IInvoice[], IInvoice>;
  findOverdue(): mongoose.Query<IInvoice[], IInvoice>;
  findByMonth(year: number, month: number): mongoose.Query<IInvoice[], IInvoice>;
}

const invoiceSchema: Schema = new Schema(
  {
    number: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required']
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service is required']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      validate: {
        validator: function(v: number) {
          return v >= 0 && v <= 100;
        },
        message: 'Discount must be between 0 and 100 percent'
      }
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Collector assignment is required'],
      validate: {
        validator: async function(userId: mongoose.Types.ObjectId) {
          const User = mongoose.model('User');
          const user = await User.findById(userId).populate('roleId');
          return user && user.roleId?.name === 'Collector';
        },
        message: 'Assigned user must be a Collector'
      }
    },
    balance: {
      type: Number,
      required: [true, 'Balance is required'],
      min: [0, 'Balance cannot be negative']
    },
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Amount cannot be negative']
    },
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.UNPAID,
      required: [true, 'Status is required']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);



// Pre-save middleware to auto-generate invoice number
invoiceSchema.pre('save', async function (next) {
  if (this.isNew && !this.number) {
    try {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const lastInvoice = await mongoose.model('Invoice').findOne({
        number: new RegExp(`^INV-${year}${month}-`)
      }, {}, { sort: { number: -1 } });
      
      let sequence = 1;
      if (lastInvoice) {
        const lastSequence = parseInt(lastInvoice.number.split('-')[2]);
        sequence = lastSequence + 1;
      }
      
      this.number = `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// Pre-save middleware to update status based on amount paid
invoiceSchema.pre('save', function (next) {
  if (this.isModified('amount') || this.isModified('balance') || this.isModified('discount')) {
    const finalBalance = (this as any).balance - ((this as any).balance * (this as any).discount / 100);
    
    if ((this as any).amount >= finalBalance) {
      (this as any).status = InvoiceStatus.PAID;
    } else if ((this as any).amount > 0) {
      (this as any).status = InvoiceStatus.PARTIALLY_PAID;
    } else {
      (this as any).status = InvoiceStatus.UNPAID;
    }
  }
  next();
});

// Pre-find middleware to populate related data
invoiceSchema.pre('find', function (next) {
  this.populate([
    { path: 'customerId', select: 'name phoneNumber location building level street' },
    { path: 'serviceId', select: 'name cost' },
    { path: 'assignedTo', select: 'firstName lastName email phoneNumber' }
  ]);
  next();
});

invoiceSchema.pre('findOne', function (next) {
  this.populate([
    { path: 'customerId', select: 'name phoneNumber location building level street' },
    { path: 'serviceId', select: 'name cost' },
    { path: 'assignedTo', select: 'firstName lastName email phoneNumber' }
  ]);
  next();
});

// Instance method to apply discount
invoiceSchema.methods.applyDiscount = function (discountPercentage: number) {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Discount must be between 0 and 100 percent');
  }
  this.discount = discountPercentage;
  return this.save();
};

// Instance method to remove discount
invoiceSchema.methods.removeDiscount = function () {
  this.discount = 0;
  return this.save();
};

// Instance method to make payment
invoiceSchema.methods.makePayment = function (paymentAmount: number) {
  if (paymentAmount < 0) {
    throw new Error('Payment amount cannot be negative');
  }
  
  const finalBalance = this.balance - (this.balance * this.discount / 100);
  const newAmount = this.amount + paymentAmount;
  
  if (newAmount > finalBalance) {
    throw new Error('Payment amount exceeds remaining balance');
  }
  
  this.amount = newAmount;
  return this.save();
};

// Instance method to get remaining balance after discount
invoiceSchema.methods.getRemainingBalance = function () {
  const finalBalance = this.balance - (this.balance * this.discount / 100);
  return finalBalance - this.amount;
};

// Static methods for querying
invoiceSchema.statics.findByStatus = function (status: InvoiceStatus) {
  return this.find({ status });
};

invoiceSchema.statics.findByCollector = function (collectorId: mongoose.Types.ObjectId) {
  return this.find({ assignedTo: collectorId });
};

invoiceSchema.statics.findByCustomer = function (customerId: mongoose.Types.ObjectId) {
  return this.find({ customerId });
};

invoiceSchema.statics.findOverdue = function () {
  return this.find({ 
    dueDate: { $lt: new Date() },
    status: { $ne: InvoiceStatus.PAID }
  });
};

invoiceSchema.statics.findByMonth = function (year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  return this.find({
    createdAt: { $gte: startDate, $lte: endDate }
  });
};

const Invoice = mongoose.model<IInvoice, IInvoiceModel>('Invoice', invoiceSchema);
export default Invoice;
