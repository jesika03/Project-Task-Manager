/**
 * ProjectMember Controller
 * Manages project membership and team assignment
 */

import { dbStore, generateId } from '../utils/mockStore.js';
import { logActivity } from './activityController.js';

// @desc    Get members of a project
// @route   GET /api/projects/:projectId/members
// @access  Private
export const getProjectMembers = (req, res) => {
  const { projectId } = req.params;

  const project = dbStore.projects.find((p) => p._id === projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const members = dbStore.projectMembers
    .filter((m) => m.project === projectId)
    .map((m) => {
      const u = dbStore.users.find((user) => user._id === m.user);
      return {
        _id: m._id,
        projectId: m.project,
        roleInProject: m.roleInProject,
        joinedAt: m.joinedAt,
        user: u
          ? {
              _id: u._id,
              name: u.name,
              email: u.email,
              role: u.role,
              department: u.department,
              avatar: u.avatar,
            }
          : null,
      };
    })
    .filter((m) => m.user !== null);

  return res.json({ success: true, data: members });
};

// @desc    Add member to a project
// @route   POST /api/projects/:projectId/members
// @access  Private (Admin or Project Manager)
export const addProjectMember = (req, res) => {
  const { projectId } = req.params;
  const { userId, roleInProject } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'Please select a user to add.' });
  }

  const project = dbStore.projects.find((p) => p._id === projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const targetUser = dbStore.users.find((u) => u._id === userId);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'User to add not found in system.' });
  }

  // Check if member already in project
  const existing = dbStore.projectMembers.find(
    (m) => m.project === projectId && m.user === userId
  );
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'This user is already a member of this project.',
    });
  }

  const newMember = {
    _id: 'pmem_' + generateId(),
    project: projectId,
    user: userId,
    roleInProject: roleInProject || 'Developer',
    joinedAt: new Date(),
  };

  dbStore.projectMembers.push(newMember);

  logActivity({
    userId: req.user._id,
    action: 'ADDED_MEMBER',
    entityType: 'Member',
    entityId: newMember._id,
    details: `${req.user.name} added ${targetUser.name} (${newMember.roleInProject}) to "${project.title}"`,
  });

  return res.status(201).json({
    success: true,
    message: 'Team member added successfully.',
    data: {
      ...newMember,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        department: targetUser.department,
        avatar: targetUser.avatar,
      },
    },
  });
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:projectId/members/:memberId
// @access  Private (Admin or Project Manager)
export const removeProjectMember = (req, res) => {
  const { projectId, memberId } = req.params;

  const memberIndex = dbStore.projectMembers.findIndex(
    (m) => m._id === memberId && m.project === projectId
  );

  if (memberIndex === -1) {
    return res.status(404).json({ success: false, message: 'Project member record not found.' });
  }

  const removed = dbStore.projectMembers.splice(memberIndex, 1)[0];
  const user = dbStore.users.find((u) => u._id === removed.user);
  const project = dbStore.projects.find((p) => p._id === projectId);

  logActivity({
    userId: req.user._id,
    action: 'REMOVED_MEMBER',
    entityType: 'Member',
    entityId: removed._id,
    details: `${req.user.name} removed ${user ? user.name : 'member'} from project "${project?.title || ''}"`,
  });

  return res.json({ success: true, message: 'Member removed from project.' });
};
