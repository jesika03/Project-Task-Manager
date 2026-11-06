/**
 * Project Controller
 * CRUD operations, search, filters, pagination, sorting, and progress stats
 */

import { dbStore, generateId } from '../utils/mockStore.js';
import { logActivity } from './activityController.js';

// Helper to compute project progress
const attachProjectMetrics = (proj) => {
  const tasks = dbStore.tasks.filter((t) => t.project === proj._id);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'Completed') return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Project creator details
  const creator = dbStore.users.find((u) => u._id === proj.createdBy);

  // Members count
  const members = dbStore.projectMembers.filter((m) => m.project === proj._id);

  return {
    ...proj,
    progress,
    totalTasks,
    completedTasks,
    overdueTasks,
    memberCount: members.length,
    createdBy: creator
      ? { _id: creator._id, name: creator.name, email: creator.email, avatar: creator.avatar }
      : { name: 'Unknown' },
  };
};

// @desc    Get all projects with search, status/priority filter, pagination, sorting
// @route   GET /api/projects
// @access  Private
export const getProjects = (req, res) => {
  let list = dbStore.projects.map(attachProjectMetrics);

  const {
    search,
    status,
    priority,
    category,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 6,
  } = req.query;

  // Team Member scope: can see all projects or filter by membership if required
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }

  if (status && status !== 'All') {
    list = list.filter((p) => p.status === status);
  }

  if (priority && priority !== 'All') {
    list = list.filter((p) => p.priority === priority);
  }

  if (category && category !== 'All') {
    list = list.filter((p) => p.category === category);
  }

  // Sorting
  list.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'endDate' || sortBy === 'createdAt') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    } else if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 6;
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

// @desc    Get single project by ID with members and task summary
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = (req, res) => {
  const project = dbStore.projects.find((p) => p._id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const detailed = attachProjectMetrics(project);

  // Get project members populated
  const memberRecords = dbStore.projectMembers
    .filter((m) => m.project === project._id)
    .map((m) => {
      const u = dbStore.users.find((user) => user._id === m.user);
      return {
        _id: m._id,
        roleInProject: m.roleInProject,
        joinedAt: m.joinedAt,
        user: u ? { _id: u._id, name: u.name, email: u.email, role: u.role, department: u.department, avatar: u.avatar } : null,
      };
    })
    .filter((m) => m.user !== null);

  return res.json({
    success: true,
    data: {
      ...detailed,
      members: memberRecords,
    },
  });
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin or Project Manager)
export const createProject = (req, res, next) => {
  try {
    const { title, description, category, status, priority, startDate, endDate, budget } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Project description is required.' });
    }
    if (!endDate) {
      return res.status(400).json({ success: false, message: 'Project target end date is required.' });
    }

    const newProject = {
      _id: 'proj_' + generateId(),
      title: title.trim(),
      description: description.trim(),
      category: category || 'Web Development',
      status: status || 'Active',
      priority: priority || 'Medium',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      createdBy: req.user._id,
      budget: Number(budget) || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.projects.unshift(newProject);

    // Automatically add creator as Lead member in ProjectMember
    dbStore.projectMembers.push({
      _id: 'pmem_' + generateId(),
      project: newProject._id,
      user: req.user._id,
      roleInProject: 'Lead',
      joinedAt: new Date(),
    });

    logActivity({
      userId: req.user._id,
      action: 'CREATED_PROJECT',
      entityType: 'Project',
      entityId: newProject._id,
      details: `${req.user.name} created new project: "${newProject.title}"`,
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully!',
      data: attachProjectMetrics(newProject),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin or Project Manager)
export const updateProject = (req, res, next) => {
  try {
    const projectIndex = dbStore.projects.findIndex((p) => p._id === req.params.id);
    if (projectIndex === -1) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const { title, description, category, status, priority, startDate, endDate, budget } = req.body;
    const project = dbStore.projects[projectIndex];

    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (category) project.category = category;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (startDate) project.startDate = new Date(startDate);
    if (endDate) project.endDate = new Date(endDate);
    if (budget !== undefined) project.budget = Number(budget);

    project.updatedAt = new Date();
    dbStore.projects[projectIndex] = project;

    logActivity({
      userId: req.user._id,
      action: 'UPDATED_PROJECT',
      entityType: 'Project',
      entityId: project._id,
      details: `${req.user.name} updated project details for: "${project.title}"`,
    });

    return res.json({
      success: true,
      message: 'Project updated successfully!',
      data: attachProjectMetrics(project),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin or Project Manager)
export const deleteProject = (req, res) => {
  const projectIndex = dbStore.projects.findIndex((p) => p._id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const deleted = dbStore.projects.splice(projectIndex, 1)[0];

  // Cascade delete members, tasks, and task comments
  const relatedTasks = dbStore.tasks.filter((t) => t.project === deleted._id);
  const relatedTaskIds = relatedTasks.map((t) => t._id);

  dbStore.projectMembers = dbStore.projectMembers.filter((m) => m.project !== deleted._id);
  dbStore.tasks = dbStore.tasks.filter((t) => t.project !== deleted._id);
  dbStore.comments = dbStore.comments.filter((c) => !relatedTaskIds.includes(c.task));

  logActivity({
    userId: req.user._id,
    action: 'DELETED_PROJECT',
    entityType: 'Project',
    entityId: deleted._id,
    details: `${req.user.name} deleted project "${deleted.title}" and its linked tasks`,
  });

  return res.json({ success: true, message: 'Project and associated tasks deleted successfully.' });
};
