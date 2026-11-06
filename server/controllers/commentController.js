/**
 * Comment Controller
 * Task discussion and audit comments
 */

import { dbStore, generateId } from '../utils/mockStore.js';
import { logActivity } from './activityController.js';

// @desc    Get all comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
export const getCommentsByTask = (req, res) => {
  const { taskId } = req.params;

  const task = dbStore.tasks.find((t) => t._id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  const comments = dbStore.comments
    .filter((c) => c.task === taskId)
    .map((c) => {
      const u = dbStore.users.find((user) => user._id === c.user);
      return {
        _id: c._id,
        task: c.task,
        message: c.message,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        user: u
          ? {
              _id: u._id,
              name: u.name,
              email: u.email,
              role: u.role,
              avatar: u.avatar,
            }
          : { name: 'Unknown User' },
      };
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return res.json({ success: true, count: comments.length, data: comments });
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
export const createComment = (req, res) => {
  const { taskId } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
  }

  const task = dbStore.tasks.find((t) => t._id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  const newComment = {
    _id: 'comm_' + generateId(),
    task: taskId,
    user: req.user._id,
    message: message.trim(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  dbStore.comments.push(newComment);

  logActivity({
    userId: req.user._id,
    action: 'COMMENT_ADDED',
    entityType: 'Comment',
    entityId: newComment._id,
    details: `${req.user.name} commented on task "${task.title}": "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`,
  });

  return res.status(201).json({
    success: true,
    message: 'Comment posted.',
    data: {
      ...newComment,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
      },
    },
  });
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Author, Admin, or Project Manager)
export const deleteComment = (req, res) => {
  const commentIndex = dbStore.comments.findIndex((c) => c._id === req.params.id);
  if (commentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Comment not found.' });
  }

  const comment = dbStore.comments[commentIndex];

  // Only author, Admin, or PM can delete
  if (comment.user !== req.user._id && !['Admin', 'Project Manager'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this comment.' });
  }

  dbStore.comments.splice(commentIndex, 1);

  return res.json({ success: true, message: 'Comment removed.' });
};
