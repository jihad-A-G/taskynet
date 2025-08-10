import mongoose, { Document, Schema } from 'mongoose';

export interface ICollectorBalance extends Document {
  collectorId: mongoose.Types.ObjectId;
  balanceLBP: number;
  balanceUSD: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICollectorBalanceModel extends mongoose.Model<ICollectorBalance> {
  updateBalance(collectorId: mongoose.Types.ObjectId, amount: number, currency: 'LBP' | 'USD', operation: 'add' | 'subtract'): Promise<ICollectorBalance>;
  getCollectorBalances(): Promise<ICollectorBalance[]>;
}

const collectorBalanceSchema: Schema = new Schema(
  {
    collectorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Collector is required'],
      unique: true
    },
    balanceLBP: {
      type: Number,
      default: 0
    },
    balanceUSD: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Static method to update collector balance
collectorBalanceSchema.statics.updateBalance = async function (
  collectorId: mongoose.Types.ObjectId, 
  amount: number, 
  currency: 'LBP' | 'USD', 
  operation: 'add' | 'subtract'
) {
  const multiplier = operation === 'add' ? 1 : -1;
  const updateField = currency === 'LBP' ? 'balanceLBP' : 'balanceUSD';
  
  return await this.findOneAndUpdate(
    { collectorId },
    { $inc: { [updateField]: amount * multiplier } },
    { upsert: true, new: true }
  ).populate('collectorId', 'firstName lastName email phoneNumber');
};

// Static method to get all collector balances
collectorBalanceSchema.statics.getCollectorBalances = function () {
  return this.find().populate('collectorId', 'firstName lastName email phoneNumber');
};

// Pre-find middleware to populate collector data
collectorBalanceSchema.pre('find', function (next) {
  this.populate('collectorId', 'firstName lastName email phoneNumber');
  next();
});

collectorBalanceSchema.pre('findOne', function (next) {
  this.populate('collectorId', 'firstName lastName email phoneNumber');
  next();
});

const CollectorBalance = mongoose.model<ICollectorBalance, ICollectorBalanceModel>('CollectorBalance', collectorBalanceSchema);
export default CollectorBalance;
