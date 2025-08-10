import mongoose, { Document, Schema } from 'mongoose';

export enum TransactionType {
  RECEIVED = 'received', // Money received from collector
  PAID = 'paid'         // Money paid to collector
}

export interface ICollectorTransaction extends Document {
  collectorId: mongoose.Types.ObjectId;
  amount: number;
  currency: 'LBP' | 'USD';
  type: TransactionType;
  description?: string;
  processedBy: mongoose.Types.ObjectId; // Admin who processed
  createdAt: Date;
  updatedAt: Date;
}

const collectorTransactionSchema: Schema = new Schema(
  {
    collectorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Collector is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive']
    },
    currency: {
      type: String,
      enum: ['LBP', 'USD'],
      required: [true, 'Currency is required']
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, 'Transaction type is required']
    },
    description: {
      type: String,
      trim: true
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Processing admin is required']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Pre-find middleware to populate related data
collectorTransactionSchema.pre('find', function (next) {
  this.populate([
    { path: 'collectorId', select: 'firstName lastName email' },
    { path: 'processedBy', select: 'firstName lastName email' }
  ]);
  next();
});

collectorTransactionSchema.pre('findOne', function (next) {
  this.populate([
    { path: 'collectorId', select: 'firstName lastName email' },
    { path: 'processedBy', select: 'firstName lastName email' }
  ]);
  next();
});

const CollectorTransaction = mongoose.model<ICollectorTransaction>('CollectorTransaction', collectorTransactionSchema);
export default CollectorTransaction;
