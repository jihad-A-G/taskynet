import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Role name must be at least 2 characters long'],
      maxlength: [50, 'Role name cannot exceed 50 characters']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);


// Pre-save middleware to ensure name is capitalized
roleSchema.pre('save', function (next) {
  if (this.name && typeof this.name === 'string') {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
  }
  next();
});

const Role = mongoose.model<IRole>('Role', roleSchema);
export default Role;
