import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters long'],
      maxlength: [100, 'Category name cannot exceed 100 characters']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);



// Pre-save middleware to ensure name is properly formatted
categorySchema.pre('save', function (next) {
  if (this.name && typeof this.name === 'string') {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
  }
  next();
});

const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
