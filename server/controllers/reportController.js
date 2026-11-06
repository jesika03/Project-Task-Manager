/**
 * Reports Controller
 * Requirement 8: Summary / reports of tasks, overdue work, status breakdown, project progress records.
 */

import { dbStore } from '../utils/mockStore.js';
import { enrichTask } from './taskController.js';

// @desc    Get comprehensive project and task analytics report
// @route   GET /api/reports/summary
// @access  Private
export const getSummaryReport = (req, res) => {
  const allTasks = dbStore.tasks.map(enrichTask);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress').length;
  const reviewTasks = allTasks.filter((t) => t.status === 'Review').length;
  const todoTasks = allTasks.filter((t) => t.status === 'Todo').length;
  const overdueTasksList = allTasks.filter((t) => t.isOverdue);

  const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Project progress breakdown
  const projectReports = dbStore.projects.map((proj) => {
    const pTasks = allTasks.filter((t) => t.project?._id === proj._id);
    const pTotal = pTasks.length;
    const pCompleted = pTasks.filter((t) => t.status === 'Completed').length;
    const pOverdue = pTasks.filter((t) => t.isOverdue).length;
    const progress = pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0;

    return {
      _id: proj._id,
      title: proj.title,
      category: proj.category,
      status: proj.status,
      priority: proj.priority,
      endDate: proj.endDate,
      totalTasks: pTotal,
      completedTasks: pCompleted,
      overdueTasks: pOverdue,
      progress,
    };
  });

  // Priority distribution
  const priorityDistribution = {
    Urgent: allTasks.filter((t) => t.priority === 'Urgent').length,
    High: allTasks.filter((t) => t.priority === 'High').length,
    Medium: allTasks.filter((t) => t.priority === 'Medium').length,
    Low: allTasks.filter((t) => t.priority === 'Low').length,
  };

  // Status breakdown
  const statusDistribution = {
    Todo: todoTasks,
    'In Progress': inProgressTasks,
    Review: reviewTasks,
    Completed: completedTasks,
  };

  // Team Member Workload
  const memberWorkload = dbStore.users
    .filter((u) => u.role !== 'Admin')
    .map((user) => {
      const userTasks = allTasks.filter((t) => t.assignedTo?._id === user._id);
      const userCompleted = userTasks.filter((t) => t.status === 'Completed').length;
      const userOverdue = userTasks.filter((t) => t.isOverdue).length;
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        totalAssigned: userTasks.length,
        completed: userCompleted,
        pending: userTasks.length - userCompleted,
        overdue: userOverdue,
      };
    });

  return res.json({
    success: true,
    data: {
      metrics: {
        totalProjects: dbStore.projects.length,
        activeProjects: dbStore.projects.filter((p) => p.status === 'Active').length,
        completedProjects: dbStore.projects.filter((p) => p.status === 'Completed').length,
        totalTasks,
        completedTasks,
        inProgressTasks,
        reviewTasks,
        todoTasks,
        overdueCount: overdueTasksList.length,
        completionRate: overallCompletionRate,
        totalUsers: dbStore.users.length,
      },
      statusDistribution,
      priorityDistribution,
      projectReports,
      memberWorkload,
      overdueItems: overdueTasksList.map((t) => ({
        _id: t._id,
        title: t.title,
        projectTitle: t.project?.title,
        assigneeName: t.assignedTo?.name,
        dueDate: t.dueDate,
        daysOverdue: t.daysOverdue,
        priority: t.priority,
        status: t.status,
      })),
    },
  });
};
