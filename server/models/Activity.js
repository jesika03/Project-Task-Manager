import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATED_PROJECT',
        'UPDATED_PROJECT',
        'DELETED_PROJECT',
        'ADDED_MEMBER',
        'REMOVED_MEMBER',
        'CREATED_TASK',
        'UPDATED_TASK',
        'STATUS_CHANGED',
        'DELETED_TASK',
        'COMMENT_ADDED',
        'USER_REGISTERED',
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Project', 'Task', 'Member', 'Comment', 'User'],
    },
    entityId: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

activitySchema.index({ createdAt: -1 });
activitySchema.index({ user: 1 });
activitySchema.index({ entityType: 1, entityId: 1 });

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
export default Activity;
