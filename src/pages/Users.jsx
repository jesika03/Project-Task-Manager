import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../services/api.js';
import {
  Users as UsersIcon,
  Plus,
  Search,
  Filter,
  Shield,
  Building,
  Mail,
  Trash2,
  Edit2,
  Lock,
} from 'lucide-react';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import {
  FeedbackBanner,
  EmptyState,
  LoadingSpinner,
} from '../components/FeedbackBanner.jsx';

export default function Users() {
  const { user, hasRole } = useAuth();

  const [usersList, setUsersList] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Feedback & Forms
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Team Member',
    department: 'Computer Science',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit: 10,
        search,
        role: roleFilter,
        sortBy,
        sortOrder,
      }).toString();

      const res = await apiFetch(`/users?${query}`);
      if (res.success) {
        setUsersList(res.data);
        setTotal(res.total);
        setPages(res.pages);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, sortBy, sortOrder]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!createFormData.name.trim()) {
      setFormError('User name is required.');
      return;
    }
    if (!createFormData.email.trim()) {
      setFormError('Email address is required.');
      return;
    }
    if (!createFormData.password || createFormData.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(createFormData),
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'User added to system directory!' });
        setIsCreateModalOpen(false);
        setCreateFormData({
          name: '',
          email: '',
          password: '',
          role: 'Team Member',
          department: 'Computer Science',
        });
        fetchUsers();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError('');

    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/users/${editingUser._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingUser.name,
          role: editingUser.role,
          department: editingUser.department,
        }),
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'User updated successfully.' });
        setIsEditModalOpen(false);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to update user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user ${userName}?`)) return;

    try {
      const res = await apiFetch(`/users/${userId}`, { method: 'DELETE' });
      if (res.success) {
        setFeedback({ type: 'success', message: 'User deleted from system.' });
        fetchUsers();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-indigo-600" />
            <span>User Directory & Role Access</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Requirement #1 & #2: Manage User entities, credentials, and role privileges
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        )}
      </div>

      <FeedbackBanner
        type={feedback.type}
        message={feedback.message}
        onDismiss={() => setFeedback({ type: '', message: '' })}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search user by name, email, department..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Team Member">Team Member</option>
            </select>
          </div>

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
              <option value="createdAt:desc">Newest First</option>
              <option value="name:asc">Name (A-Z)</option>
              <option value="role:asc">Role (Ascending)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Loading users directory..." />
      ) : usersList.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No Users Found"
          description="Try broadening your search query or reset role filters."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">User Profile</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Joined Date</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`
                          }
                          alt={u.name}
                          className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-xs ${
                          u.role === 'Admin'
                            ? 'text-purple-700'
                            : u.role === 'Project Manager'
                            ? 'text-indigo-700'
                            : 'text-slate-600'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{u.role}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                      {u.department || 'General'}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap font-mono tabular-nums text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {isAdmin && (
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser({ ...u });
                              setIsEditModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                            title="Edit user"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {u._id !== user?._id && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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
        label="users"
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register New College User"
      >
        <FeedbackBanner
          type="error"
          message={formError}
          onDismiss={() => setFormError('')}
        />

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={createFormData.name}
              onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
              placeholder="e.g. Ananya Sharma"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={createFormData.email}
              onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
              placeholder="e.g. ananya@college.edu"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign Role *
              </label>
              <select
                value={createFormData.role}
                onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                disabled={isSubmitting}
              >
                <option value="Team Member">Team Member</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={createFormData.department}
                onChange={(e) => setCreateFormData({ ...createFormData, department: e.target.value })}
                placeholder="e.g. Information Tech"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Password *
            </label>
            <input
              type="password"
              value={createFormData.password}
              onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
              placeholder="Min 6 characters"
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
              {isSubmitting ? 'Creating...' : 'Register User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit User: ${editingUser.name}`}
        >
          <FeedbackBanner
            type="error"
            message={formError}
            onDismiss={() => setFormError('')}
          />

          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role (Admin only authorization)
              </label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                disabled={isSubmitting}
              >
                <option value="Team Member">Team Member</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={editingUser.department || ''}
                onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
