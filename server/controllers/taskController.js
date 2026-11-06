/**
 * Task Controller
 * Core workflow: task creation, assignment, status tracking, overdue detection,
 * comments link, search, filters, sorting, and pagination.
 */

import { dbStore, generateId } from '../utils/mockStore.js';
import { logActivity } from './activityController.js';

// Helper to calculate overdue status & days overdue
export const enrichTask = (task) => {
  const isCompleted = task.status === 'Completed';
  const dueDateObj = new Date(task.dueDate);
  const now = new Date();
  const isOverdue = !isCompleted && dueDateObj < now;

  let daysOverdue = 0;
  if (isOverdue) {
    const diffMs = now.getTime() - dueDateObj.getTime();
    daysOverdue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  // Populate project
  const project = dbStore.projects.find((p) => p._id === task.project);

  // Populate assignedTo
  const assignee = dbStore.users.find((u) => u._id === task.assignedTo);

  // Populate createdBy
  const creator = dbStore.users.find((u) => u._id === task.createdBy);

  // Comments count
  const commentsCount = dbStore.comments.filter((c) => c.task === task._id).length;

  return {
    ...task,
    isOverdue,
    daysOverdue,
    commentsCount,
    project: project
      ? { _id: project._id, title: project.title, status: project.status, priority: project.priority }
      : { _id: task.project, title: 'Unknown Project' },
    assignedTo: assignee
      ? { _id: assignee._id, name: assignee.name, email: assignee.email, role: assignee.role, avatar: assignee.avatar }
      : { _id: task.assignedTo, name: 'Unassigned' },
    createdBy: creator
      ? { _id: creator._id, name: creator.name, email: creator.email }
      : { _id: task.createdBy, name: 'Unknown' },
  };
};

// Priority sort weight
const priorityWeight = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

// @desc    Get all tasks with search, filters, pagination, and sorting
// @route   GET /api/tasks
// @access  Private
export const getTasks = (req, res) => {
  let list = dbStore.tasks.map(enrichTask);

  const {
    search,
    project,
    assignedTo,
    status,
    priority,
    isOverdue,
    myTasksOnly,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = req.query;

  // Filter for Team Member if myTasksOnly is selected
  if (myTasksOnly === 'true' || req.user.role === 'Team Member' && req.query.scope === 'mine') {
    list = list.filter((t) => t.assignedTo?._id === req.user._id);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }

  if (project && project !== 'All') {
    list = list.filter((t) => t.project?._id === project);
  }

  if (assignedTo && assignedTo !== 'All') {
    list = list.filter((t) => t.assignedTo?._id === assignedTo);
  }

  if (status && status !== 'All') {
    list = list.filter((t) => t.status === status);
  }

  if (priority && priority !== 'All') {
    list = list.filter((t) => t.priority === priority);
  }

  if (isOverdue === 'true') {
    list = list.filter((t) => t.isOverdue);
  }

  // Sorting
  list.sort((a, b) => {
    if (sortBy === 'priority') {
      const pA = priorityWeight[a.priority] || 0;
      const pB = priorityWeight[b.priority] || 0;
      return sortOrder === 'asc' ? pA - pB : pB - pA;
    }

    if (sortBy === 'dueDate' || sortBy === 'createdAt') {
      const dateA = new Date(a[sortBy]).getTime();
      const dateB = new Date(b[sortBy]).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }

    let valA = a[sortBy] || '';
    let valB = b[sortBy] || '';
    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const total = list.length;
  const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: paginated,
  });
};

// @desc    Get overdue tasks
// @route   GET /api/tasks/overdue
// @access  Private
export const getOverdueTasks = (req, res) => {
  const overdueList = dbStore.tasks
    .map(enrichTask)
    .filter((t) => t.isOverdue)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return res.json({
    success: true,
    count: overdueList.length,
    data: overdueList,
  });
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = (req, res) => {
  const task = dbStore.tasks.find((t) => t._id === req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  const enriched = enrichTask(task);
  return res.json({ success: true, data: enriched });
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin, Project Manager, or Lead)
export const createTask = (req, res, next) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      dueDate,
      estimatedHours,
      tags,
    } = req.body;

    // Express Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }
    if (!project) {
      return res.status(400).json({ success: false, message: 'Target project is required.' });
    }
    const projectObj = dbStore.projects.find((p) => p._id === project);
    if (!projectObj) {
      return res.status(400).json({ success: false, message: 'Selected project does not exist.' });
    }
    if (!assignedTo) {
      return res.status(400).json({ success: false, message: 'Task assignee is required.' });
    }
    const assigneeObj = dbStore.users.find((u) => u._id === assignedTo);
    if (!assigneeObj) {
      return res.status(400).json({ success: false, message: 'Selected assignee user does not exist.' });
    }
    if (!dueDate) {
      return res.status(400).json({ success: false, message: 'Due date is required.' });
    }

    const newTask = {
      _id: 'task_' + generateId(),
      title: title.trim(),
      description: description ? description.trim() : '',
      project,
      assignedTo,
      createdBy: req.user._id,
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate: new Date(dueDate),
      estimatedHours: Number(estimatedHours) || 4,
      actualHours: 0,
      completedAt: status === 'Completed' ? new Date() : null,
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.tasks.unshift(newTask);

    logActivity({
      userId: req.user._id,
      action: 'CREATED_TASK',
      entityType: 'Task',
      entityId: newTask._id,
      details: `${req.user.name} created task "${newTask.title}" for ${assigneeObj.name}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully!',
      data: enrichTask(newTask),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = (req, res, next) => {
  try {
    const taskIndex = dbStore.tasks.findIndex((t) => t._id === req.params.id);
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const task = dbStore.tasks[taskIndex];
    const {
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      dueDate,
      estimatedHours,
      actualHours,
      tags,
    } = req.body;

    const oldStatus = task.status;

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (project) task.project = project;
    if (assignedTo) task.assignedTo = assignedTo;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = new Date(dueDate);
    if (estimatedHours !== undefined) task.estimatedHours = Number(estimatedHours);
    if (actualHours !== undefined) task.actualHours = Number(actualHours);
    if (tags !== undefined) {
      task.tags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    }

    if (status && status !== oldStatus) {
      task.status = status;
      if (status === 'Completed') {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
      logActivity({
        userId: req.user._id,
        action: 'STATUS_CHANGED',
        entityType: 'Task',
        entityId: task._id,
        details: `${req.user.name} moved task "${task.title}" from [${oldStatus}] to [${status}]`,
      });
    }

    task.updatedAt = new Date();
    dbStore.tasks[taskIndex] = task;

    logActivity({
      userId: req.user._id,
      action: 'UPDATED_TASK',
      entityType: 'Task',
      entityId: task._id,
      details: `${req.user.name} updated task details for "${task.title}"`,
    });

    return res.json({
      success: true,
      message: 'Task updated successfully!',
      data: enrichTask(task),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick status change (Any team member assigned or PM/Admin)
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = (req, res) => {
  const taskIndex = dbStore.tasks.findIndex((t) => t._id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  const task = dbStore.tasks[taskIndex];
  const { status, actualHours } = req.body;

  const validStatuses = ['Todo', 'In Progress', 'Review', 'Completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const oldStatus = task.status;
  task.status = status;

  if (status === 'Completed') {
    task.completedAt = new Date();
  } else {
    task.completedAt = null;
  }

  if (actualHours !== undefined) {
    task.actualHours = Number(actualHours);
  }

  task.updatedAt = new Date();
  dbStore.tasks[taskIndex] = task;

  logActivity({
    userId: req.user._id,
    action: 'STATUS_CHANGED',
    entityType: 'Task',
    entityId: task._id,
    details: `${req.user.name} updated status of "${task.title}" to ${status} (was ${oldStatus})`,
  });

  return res.json({
    success: true,
    message: `Task status updated to ${status}.`,
    data: enrichTask(task),
  });
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin or Project Manager)
export const deleteTask = (req, res) => {
  const taskIndex = dbStore.tasks.findIndex((t) => t._id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  const deletedTask = dbStore.tasks.splice(taskIndex, 1)[0];

  // Remove linked comments
  dbStore.comments = dbStore.comments.filter((c) => c.task !== deletedTask._id);

  logActivity({
    userId: req.user._id,
    action: 'DELETED_TASK',
    entityType: 'Task',
    entityId: deletedTask._id,
    details: `${req.user.name} deleted task "${deletedTask.title}"`,
  });

  return res.json({ success: true, message: 'Task and comments deleted successfully.' });
};
