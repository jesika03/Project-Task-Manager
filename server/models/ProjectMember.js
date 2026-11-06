import mongoose from 'mongoose';

const projectMemberSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    roleInProject: {
      type: String,
      enum: ['Lead', 'Developer', 'Designer', 'QA Tester', 'Member'],
      default: 'Developer',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user is not duplicated in the same project
projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });
projectMemberSchema.index({ user: 1 });

const ProjectMember =
  mongoose.models.ProjectMember || mongoose.model('ProjectMember', projectMemberSchema);
export default ProjectMember;
