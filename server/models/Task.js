import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [120, 'Task title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project assignment is required'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must be assigned to a team member'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Review', 'Completed'],
      default: 'Todo',
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Please specify a due date for this task'],
    },
    estimatedHours: {
      type: Number,
      default: 4,
      min: [0, 'Estimated hours must be positive'],
    },
    actualHours: {
      type: Number,
      default: 0,
      min: [0, 'Actual hours must be positive'],
    },
    completedAt: {
      type: Date,
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to calculate whether task is currently overdue
taskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'Completed') return false;
  if (!this.dueDate) return false;
  return new Date(this.dueDate) < new Date();
});

// Indexes for fast searching, filtering, and reporting
taskSchema.index({ project: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
export default Task;
