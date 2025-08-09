import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Service name must be at least 2 characters long'],
      maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    cost: {
      type: Number,
      required: [true, 'Service cost is required'],
      min: [0, 'Service cost cannot be negative'],
      validate: {
        validator: function(v: number) {
          return v >= 0;
        },
        message: 'Service cost must be a positive number'
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);


const Service = mongoose.model<IService>('Service', serviceSchema);
export default Service;
