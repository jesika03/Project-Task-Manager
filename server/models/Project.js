import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a project title'],
      trim: true,
      maxlength: [100, 'Project title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a project description'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Web Development', 'Mobile App', 'Cloud Systems', 'AI & ML', 'DevOps', 'General'],
      default: 'Web Development',
    },
    status: {
      type: String,
      enum: ['Planning', 'Active', 'On Hold', 'Completed'],
      default: 'Active',
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide a target project end date'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    budget: {
      type: Number,
      default: 0,
      min: [0, 'Budget cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for query performance
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ endDate: 1 });

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export default Project;
