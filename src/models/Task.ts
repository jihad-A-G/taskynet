import mongoose, { Document, Schema } from 'mongoose';

export enum TaskStage {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface ITaskComment {
  userId: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface ITask extends Document {
  taskNumber: number;
  customerId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  priority: TaskPriority;
  categoryId: mongoose.Types.ObjectId;
  stage: TaskStage;
  comments: ITaskComment[];
  description?: string;
  createdAt: Date;
  finishedAt?: Date;
  updatedAt: Date;
}

const taskCommentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for comment']
    },
    message: {
      type: String,
      required: [true, 'Comment message is required'],
      trim: true,
      minlength: [1, 'Comment message cannot be empty'],
      maxlength: [1000, 'Comment message cannot exceed 1000 characters']
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

const taskSchema: Schema = new Schema(
  {
    taskNumber: {
      type: Number,
      unique: true,
      required: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required']
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
      required: [true, 'Priority is required']
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    stage: {
      type: String,
      enum: Object.values(TaskStage),
      default: TaskStage.PENDING,
      required: [true, 'Stage is required']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    comments: [taskCommentSchema],
    finishedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);


// Compound indexes
taskSchema.index({ stage: 1, priority: -1 });
taskSchema.index({ assignedTo: 1, stage: 1 });

// Pre-save middleware to auto-increment task number
taskSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const lastTask = await mongoose.model('Task').findOne({}, {}, { sort: { taskNumber: -1 } });
      this.taskNumber = lastTask ? lastTask.taskNumber + 1 : 1;
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// Pre-save middleware to set finishedAt when task is completed
taskSchema.pre('save', function (next) {
  if (this.isModified('stage')) {
    if (this.stage === TaskStage.COMPLETED || this.stage === TaskStage.CANCELLED) {
      if (!this.finishedAt) {
        this.finishedAt = new Date();
      }
    } else {
      this.finishedAt = undefined;
    }
  }
  next();
});

// Pre-find middleware to populate related data
taskSchema.pre('find', function (next) {
  this.populate([
    { path: 'customerId', select: 'name location phoneNumber' },
    { path: 'assignedTo', select: 'firstName lastName email' },
    { path: 'categoryId', select: 'name' },
    { path: 'comments.userId', select: 'firstName lastName' }
  ]);
  next();
});

taskSchema.pre('findOne', function (next) {
  this.populate([
    { path: 'customerId', select: 'name location phoneNumber' },
    { path: 'assignedTo', select: 'firstName lastName email' },
    { path: 'categoryId', select: 'name' },
    { path: 'comments.userId', select: 'firstName lastName' }
  ]);
  next();
});

// Instance method to add comment
taskSchema.methods.addComment = function (userId: mongoose.Types.ObjectId, message: string) {
  this.comments.push({
    userId,
    message,
    createdAt: new Date()
  });
  return this.save();
};

// Instance method to assign task
taskSchema.methods.assignTo = function (userId: mongoose.Types.ObjectId) {
  this.assignedTo = userId;
  if (this.stage === TaskStage.PENDING) {
    this.stage = TaskStage.ASSIGNED;
  }
  return this.save();
};

// Instance method to update stage
taskSchema.methods.updateStage = function (newStage: TaskStage) {
  this.stage = newStage;
  return this.save();
};

// Static methods for querying
taskSchema.statics.findByStage = function (stage: TaskStage) {
  return this.find({ stage });
};

taskSchema.statics.findByPriority = function (priority: TaskPriority) {
  return this.find({ priority });
};

taskSchema.statics.findByAssignee = function (userId: mongoose.Types.ObjectId) {
  return this.find({ assignedTo: userId });
};

taskSchema.statics.findByCustomer = function (customerId: mongoose.Types.ObjectId) {
  return this.find({ customerId });
};

taskSchema.statics.findPending = function () {
  return this.find({ stage: TaskStage.PENDING });
};

taskSchema.statics.findInProgress = function () {
  return this.find({ stage: { $in: [TaskStage.ASSIGNED, TaskStage.IN_PROGRESS] } });
};

const Task = mongoose.model<ITask>('Task', taskSchema);
export default Task;
