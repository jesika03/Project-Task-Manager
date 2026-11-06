import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../services/api.js';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Clock,
  Trash2,
  MessageSquare,
  User,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import TaskDetailModal from '../components/TaskDetailModal.jsx';
import {
  FeedbackBanner,
  EmptyState,
  LoadingSpinner,
} from '../components/FeedbackBanner.jsx';

export default function Tasks() {
  const { user, hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [isOverdueOnly, setIsOverdueOnly] = useState(false);
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '',
    estimatedHours: 4,
    tags: '',
  });

  // Check URL params on mount
  useEffect(() => {
    const openId = searchParams.get('openId');
    if (openId) {
      setActiveTaskId(openId);
      setIsDetailModalOpen(true);
    }
  }, [searchParams]);

  // Load supporting projects & users
  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [projRes, usersRes] = await Promise.all([
          apiFetch('/projects?limit=50'),
          apiFetch('/users?limit=50'),
        ]);
        if (projRes.success) setProjects(projRes.data);
        if (usersRes.success) setUsers(usersRes.data);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    loadPrerequisites();
  }, []);

  // Fetch Tasks with query params
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit: 10,
        search,
        project: projectFilter,
        status: statusFilter,
        priority: priorityFilter,
        assignedTo: assigneeFilter,
        isOverdue: isOverdueOnly ? 'true' : 'false',
        sortBy,
        sortOrder,
      }).toString();

      const res = await apiFetch(`/tasks?${query}`);
      if (res.success) {
        setTasks(res.data);
        setTotal(res.total);
        setPages(res.pages);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch tasks.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [
    page,
    search,
    projectFilter,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    isOverdueOnly,
    sortBy,
    sortOrder,
  ]);

  // Handle Quick Status Change
  const handleQuickStatusChange = async (taskId, newStatus, e) => {
    e.stopPropagation();
    try {
      const res = await apiFetch(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setFeedback({ type: 'success', message: `Task marked as ${newStatus}.` });
        fetchTasks();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Handle Task Deletion
  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this task permanently?')) return;

    try {
      const res = await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
      if (res.success) {
        setFeedback({ type: 'success', message: 'Task deleted successfully.' });
        fetchTasks();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Controlled Form Submission
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Task title is required.');
      return;
    }
    if (!formData.project) {
      setFormError('Please select a project for this task.');
      return;
    }
    if (!formData.assignedTo) {
      setFormError('Please assign this task to a team member.');
      return;
    }
    if (!formData.dueDate) {
      setFormError('Task due date is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Task created successfully!' });
        setIsCreateModalOpen(false);
        setFormData({
          title: '',
          description: '',
          project: '',
          assignedTo: '',
          status: 'Todo',
          priority: 'Medium',
          dueDate: '',
          estimatedHours: 4,
          tags: '',
        });
        fetchTasks();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canManage = hasRole(['Admin', 'Project Manager']);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <span>Task Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign work, track delivery statuses, set deadlines, and manage overdue tasks
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        )}
      </div>

      <FeedbackBanner
        type={feedback.type}
        message={feedback.message}
        onDismiss={() => setFeedback({ type: '', message: '' })}
      />

      {/* Filter and Search Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          
          {/* Keyword Search */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search tasks, descriptions, tags..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="dueDate:asc">Due Date (Earliest)</option>
              <option value="dueDate:desc">Due Date (Latest)</option>
              <option value="priority:desc">Priority (High to Low)</option>
              <option value="createdAt:desc">Newest First</option>
            </select>
          </div>

        </div>

        {/* Quick Toggles: Overdue and My Tasks */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isOverdueOnly}
              onChange={(e) => {
                setIsOverdueOnly(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
            />
            <span className="font-semibold text-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Show Only Overdue Tasks</span>
            </span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Assignee:</span>
            <select
              value={assigneeFilter}
              onChange={(e) => {
                setAssigneeFilter(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 rounded border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="All">All Assignees</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Task List Table */}
      {loading ? (
        <LoadingSpinner text="Loading tasks list..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No Tasks Found"
          description={
            isOverdueOnly
              ? 'Great news! There are currently no overdue tasks.'
              : search || statusFilter !== 'All'
              ? 'No tasks matched your active search and filter parameters.'
              : 'Create a new task to get team members started on work packages.'
          }
          actionText={canManage && !isOverdueOnly ? 'Create New Task' : null}
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Task Details</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    onClick={() => {
                      setActiveTaskId(task._id);
                      setIsDetailModalOpen(true);
                    }}
                    className="hover:bg-slate-50/75 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="flex items-start gap-2">
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {task.commentsCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{task.commentsCount} comments</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                      {task.project?.title || 'Unknown Project'}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge status={task.status} isOverdue={task.isOverdue} />
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {task.assignedTo?.name?.[0] || 'U'}
                        </span>
                        <span className="text-slate-800 font-medium">
                          {task.assignedTo?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap font-mono tabular-nums">
                      <span
                        className={task.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}
                      >
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      {task.isOverdue && (
                        <span className="block text-[10px] text-rose-600 font-sans font-semibold">
                          +{task.daysOverdue}d overdue
                        </span>
                      )}
                    </td>

                    <td
                      className="px-4 py-3.5 whitespace-nowrap text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={task.status}
                          onChange={(e) => handleQuickStatusChange(task._id, e.target.value, e)}
                          className="px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        >
                          <option value="Todo">Todo</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Review">Review</option>
                          <option value="Completed">Completed</option>
                        </select>

                        {canManage && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteTask(task._id, e)}
                            title="Delete Task"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        pages={pages}
        total={total}
        onPageChange={(p) => setPage(p)}
        label="tasks"
      />

      {/* Task Details & Discussion Modal */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setActiveTaskId(null);
          searchParams.delete('openId');
          setSearchParams(searchParams);
        }}
        taskId={activeTaskId}
        onTaskUpdated={fetchTasks}
      />

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <FeedbackBanner
          type="error"
          message={formError}
          onDismiss={() => setFormError('')}
        />

        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Set up JWT Auth and bcrypt hashing"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description and specifications..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project *
              </label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                disabled={isSubmitting}
              >
                <option value="">-- Choose Project --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assignee *
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                disabled={isSubmitting}
              >
                <option value="">-- Choose Assignee --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                disabled={isSubmitting}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                disabled={isSubmitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g. backend, security, api"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
