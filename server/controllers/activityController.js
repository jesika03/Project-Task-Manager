/**
 * Activity Controller
 * Tracks audit trail of user events across projects, tasks, comments, and members
 */

import { dbStore, generateId } from '../utils/mockStore.js';

export const logActivity = ({ userId, action, entityType, entityId, details }) => {
  const activity = {
    _id: 'act_' + generateId(),
    user: userId,
    action,
    entityType,
    entityId: String(entityId),
    details,
    createdAt: new Date(),
  };
  dbStore.activities.unshift(activity);
  return activity;
};

// @desc    Get system activities with pagination and filtering
// @route   GET /api/activities
// @access  Private
export const getActivities = (req, res) => {
  let list = [...dbStore.activities];

  const { entityType, action, search, page = 1, limit = 15 } = req.query;

  if (entityType && entityType !== 'All') {
    list = list.filter((a) => a.entityType === entityType);
  }
  if (action && action !== 'All') {
    list = list.filter((a) => a.action === action);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((a) => a.details.toLowerCase().includes(q));
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Populate user info
  const populated = list.map((act) => {
    const u = dbStore.users.find((user) => user._id === act.user);
    return {
      ...act,
      user: u ? { _id: u._id, name: u.name, email: u.email, role: u.role, avatar: u.avatar } : { name: 'Unknown User' },
    };
  });

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 15;
  const total = populated.length;
  const paginated = populated.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: paginated,
  });
};
