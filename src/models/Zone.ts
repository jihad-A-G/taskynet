import mongoose, { Document, Schema } from 'mongoose';

export interface IZone extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const zoneSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Zone name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Zone name must be at least 2 characters long'],
      maxlength: [100, 'Zone name cannot exceed 100 characters']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);


// Pre-save middleware to ensure name is properly formatted
zoneSchema.pre('save', function (next) {
  if (this.name && typeof this.name === 'string') {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
  }
  next();
});

const Zone = mongoose.model<IZone>('Zone', zoneSchema);
export default Zone;
