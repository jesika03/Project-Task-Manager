import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required for comments'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author user is required'],
    },
    message: {
      type: String,
      required: [true, 'Comment message cannot be empty'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ task: 1, createdAt: -1 });
commentSchema.index({ user: 1 });

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
export default Comment;
