import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../services/api.js';
import {
  FolderKanban,
  CheckSquare,
  Users,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit3,
  UserPlus,
  ArrowLeft,
  AlertTriangle,
  DollarSign,
  Shield,
  Layers,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import Modal from '../components/Modal.jsx';
import {
  FeedbackBanner,
  EmptyState,
  LoadingSpinner,
} from '../components/FeedbackBanner.jsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'members'
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Add Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberUserId, setMemberUserId] = useState('');
  const [memberRole, setMemberRole] = useState('Developer');
  const [memberSubmitting, setMemberSubmitting] = useState(false);

  // Create Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '',
    estimatedHours: 4,
    tags: '',
  });
  const [taskFormError, setTaskFormError] = useState('');

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        apiFetch(`/projects/${id}`),
        apiFetch(`/tasks?project=${id}&limit=50`),
        apiFetch('/users?limit=50'),
      ]);

      if (projRes.success) {
        setProject(projRes.data);
        setMembers(projRes.data.members || []);
      }
      if (tasksRes.success) {
        setTasks(tasksRes.data);
      }
      if (usersRes.success) {
        setAllUsers(usersRes.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load project details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const canManage = hasRole(['Admin', 'Project Manager']);

  // Handle Quick Task Status Change
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const res = await apiFetch(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setFeedback({ type: 'success', message: `Task status updated to ${newStatus}.` });
        fetchProjectDetails();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Add Project Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberUserId) {
      setFeedback({ type: 'error', message: 'Please select a user to add as project member.' });
      return;
    }

    setMemberSubmitting(true);
    try {
      const res = await apiFetch(`/projects/${id}/members`, {
        method: 'POST',
        body: JSON.stringify({ userId: memberUserId, roleInProject: memberRole }),
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Team member added to project.' });
        setIsMemberModalOpen(false);
        setMemberUserId('');
        fetchProjectDetails();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add member.' });
    } finally {
      setMemberSubmitting(false);
    }
  };

  // Remove Project Member
  const handleRemoveMember = async (memberRecordId) => {
    if (!window.confirm('Remove this member from project team?')) return;
    try {
      const res = await apiFetch(`/projects/${id}/members/${memberRecordId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setFeedback({ type: 'success', message: 'Member removed from project.' });
        fetchProjectDetails();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Create Task for this Project
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskFormError('');

    if (!taskFormData.title.trim()) {
      setTaskFormError('Task title is required.');
      return;
    }
    if (!taskFormData.assignedTo) {
      setTaskFormError('Please select a team member to assign this task to.');
      return;
    }
    if (!taskFormData.dueDate) {
      setTaskFormError('Task due date is required.');
      return;
    }

    setTaskSubmitting(true);
    try {
      const res = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...taskFormData,
          project: id,
        }),
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Task assigned successfully!' });
        setIsTaskModalOpen(false);
        setTaskFormData({
          title: '',
          description: '',
          assignedTo: '',
          status: 'Todo',
          priority: 'Medium',
          dueDate: '',
          estimatedHours: 4,
          tags: '',
        });
        fetchProjectDetails();
      }
    } catch (err) {
      setTaskFormError(err.message || 'Failed to create task.');
    } finally {
      setTaskSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LoadingSpinner text="Loading project details..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <EmptyState
          icon={FolderKanban}
          title="Project Not Found"
          description="The requested project ID does not exist or has been deleted."
          actionText="Back to Projects"
          onAction={() => navigate('/projects')}
        />
      </div>
    );
  }

  // Filter out users already in project members
  const existingMemberUserIds = members.map((m) => m.user?._id);
  const eligibleUsers = allUsers.filter((u) => !existingMemberUserIds.includes(u._id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back Button */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </Link>

      <FeedbackBanner
        type={feedback.type}
        message={feedback.message}
        onDismiss={() => setFeedback({ type: '', message: '' })}
      />

      {/* Project Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {project.category}
              </span>
              <span className="text-slate-300">·</span>
              <StatusBadge status={project.status} />
              <span className="text-slate-300">·</span>
              <PriorityBadge priority={project.priority} />
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          {canManage && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                <span>Add Member</span>
              </button>
            </div>
          )}
        </div>

        {/* Project Key Metadata Row */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-slate-400 font-medium text-[11px]">Timeline</p>
            <p className="font-semibold text-slate-800 mt-0.5">
              {new Date(project.startDate).toLocaleDateString()} – {new Date(project.endDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-slate-400 font-medium text-[11px]">Project Lead</p>
            <p className="font-semibold text-slate-800 mt-0.5">
              {project.createdBy?.name || 'Rahul Verma'}
            </p>
          </div>

          <div>
            <p className="text-slate-400 font-medium text-[11px]">Budget</p>
            <p className="font-semibold font-mono tabular-nums text-slate-800 mt-0.5">
              ${project.budget?.toLocaleString() || '0'}
            </p>
          </div>

          <div>
            <p className="text-slate-400 font-medium text-[11px]">Completion Progress</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${project.progress || 0}%` }}
                ></div>
              </div>
              <span className="font-mono tabular-nums font-bold text-slate-800">
                {project.progress || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 py-3 px-1 transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'tasks'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks ({tasks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 py-3 px-1 transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'members'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Members ({members.length})</span>
        </button>
      </div>

      {/* Tab 1: Tasks Content */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No Tasks Assigned Yet"
              description="Start assigning tasks to team members to track progress towards completion."
              actionText={canManage ? 'Assign First Task' : null}
              onAction={() => setIsTaskModalOpen(true)}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3">Task Title</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Assignee</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks.map((task) => (
                      <tr key={task._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <Link
                            to={`/tasks?openId=${task._id}`}
                            className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block"
                          >
                            {task.title}
                          </Link>
                          {task.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
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
                            className={task.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}
                          >
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          {task.isOverdue && (
                            <span className="block text-[10px] text-rose-600 font-sans font-semibold">
                              {task.daysOverdue} days overdue
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <select
                            value={task.status}
                            onChange={(e) => handleTaskStatusChange(task._id, e.target.value)}
                            className="px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          >
                            <option value="Todo">Todo</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Team Members Content */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Members collaborating on this project and their designated roles.
            </p>
            {canManage && (
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div
                key={member._id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      member.user?.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.user?.name || 'M')}`
                    }
                    alt={member.user?.name}
                    className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{member.user?.name}</h4>
                    <p className="text-[11px] text-slate-500">{member.user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-indigo-700 font-semibold">
                      <Shield className="w-3 h-3" />
                      <span>{member.roleInProject}</span>
                    </div>
                  </div>
                </div>

                {canManage && member.roleInProject !== 'Lead' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member._id)}
                    title="Remove from project"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        title="Add Member to Project"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select User *
            </label>
            <select
              value={memberUserId}
              onChange={(e) => setMemberUserId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              disabled={memberSubmitting}
            >
              <option value="">-- Choose User from College Directory --</option>
              {eligibleUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role} · {u.department || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Role Designation *
            </label>
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              disabled={memberSubmitting}
            >
              <option value="Lead">Lead</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="QA Tester">QA Tester</option>
              <option value="Member">Member</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMemberModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={memberSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
            >
              {memberSubmitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add New Task to Project"
      >
        <FeedbackBanner
          type="error"
          message={taskFormError}
          onDismiss={() => setTaskFormError('')}
        />

        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={taskFormData.title}
              onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
              placeholder="e.g. Implement Role-Based Middleware"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={taskSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={taskFormData.description}
              onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
              placeholder="Detailed instructions or acceptance criteria..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={taskSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign To *
              </label>
              <select
                value={taskFormData.assignedTo}
                onChange={(e) => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                disabled={taskSubmitting}
              >
                <option value="">-- Choose Member --</option>
                {members.map((m) => (
                  <option key={m.user?._id} value={m.user?._id}>
                    {m.user?.name} ({m.roleInProject})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={taskFormData.priority}
                onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                disabled={taskSubmitting}
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
                value={taskFormData.dueDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={taskSubmitting}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                value={taskFormData.estimatedHours}
                onChange={(e) => setTaskFormData({ ...taskFormData, estimatedHours: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={taskSubmitting}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={taskSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
            >
              {taskSubmitting ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
