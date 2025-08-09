import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  location: string;
  phoneNumber: string;
  serviceId: mongoose.Types.ObjectId;
  zoneId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Customer name must be at least 2 characters long'],
      maxlength: [100, 'Customer name cannot exceed 100 characters']
    },
    location: {
      type: String,
      required: [true, 'Customer location is required'],
      trim: true,
      minlength: [5, 'Location must be at least 5 characters long'],
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      unique: true,
      validate: {
        validator: function(v: string) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: 'Phone number is not valid'
      }
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service is required']
    },
    zoneId: {
      type: Schema.Types.ObjectId,
      ref: 'Zone',
      required: [true, 'Zone is required']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);


// Pre-find middleware to populate service and zone information
customerSchema.pre('find', function (next) {
  this.populate([
    { path: 'serviceId', select: 'name cost' },
    { path: 'zoneId', select: 'name' }
  ]);
  next();
});

customerSchema.pre('findOne', function (next) {
  this.populate([
    { path: 'serviceId', select: 'name cost' },
    { path: 'zoneId', select: 'name' }
  ]);
  next();
});

// Static method to find active customers
customerSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Static method to find customers by zone
customerSchema.statics.findByZone = function (zoneId: mongoose.Types.ObjectId) {
  return this.find({ zoneId, isActive: true });
};

// Static method to find customers by service
customerSchema.statics.findByService = function (serviceId: mongoose.Types.ObjectId) {
  return this.find({ serviceId, isActive: true });
};

const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
export default Customer;
