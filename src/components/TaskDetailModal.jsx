import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../services/api.js';
import {
  Clock,
  Calendar,
  AlertCircle,
  MessageSquare,
  Send,
  Trash2,
  User,
  FolderKanban,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import Modal from './Modal.jsx';
import { FeedbackBanner, LoadingSpinner } from './FeedbackBanner.jsx';

export default function TaskDetailModal({ isOpen, onClose, taskId, onTaskUpdated }) {
  const { user, hasRole } = useAuth();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchTaskAndComments = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const [taskRes, commentsRes] = await Promise.all([
        apiFetch(`/tasks/${taskId}`),
        apiFetch(`/tasks/${taskId}/comments`),
      ]);

      if (taskRes.success) setTask(taskRes.data);
      if (commentsRes.success) setComments(commentsRes.data);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load task details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskAndComments();
    }
  }, [isOpen, taskId]);

  // Handle posting comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await apiFetch(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ message: commentText }),
      });

      if (res.success) {
        setComments([...comments, res.data]);
        setCommentText('');
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to post comment.' });
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle deleting comment
  const handleDeleteComment = async (commentId) => {
    try {
      const res = await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });
      if (res.success) {
        setComments(comments.filter((c) => c._id !== commentId));
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Handle task status transition
  const handleStatusChange = async (newStatus) => {
    try {
      const res = await apiFetch(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setTask(res.data);
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task?.title || 'Task Details'} maxWidth="max-w-2xl">
      <FeedbackBanner
        type={feedback.type}
        message={feedback.message}
        onDismiss={() => setFeedback({ type: '', message: '' })}
      />

      {loading ? (
        <LoadingSpinner text="Loading task information..." />
      ) : !task ? (
        <p className="text-xs text-slate-500 py-4 text-center">Task details not available.</p>
      ) : (
        <div className="space-y-6">
          
          {/* Status & Priority Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Current Status</span>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="mt-0.5 px-2 py-1 text-xs font-semibold rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="border-l border-slate-200 pl-3">
                <span className="text-[10px] text-slate-400 font-medium block">Priority</span>
                <div className="mt-1">
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-medium block">Target Deadline</span>
              <p
                className={`text-xs font-mono font-bold ${
                  task.isOverdue ? 'text-rose-600' : 'text-slate-700'
                }`}
              >
                {new Date(task.dueDate).toLocaleDateString()}
                {task.isOverdue && ` (${task.daysOverdue}d overdue!)`}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Description</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
              {task.description || 'No detailed description provided for this task.'}
            </p>
          </div>

          {/* Assignment & Project Info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium">Assigned Member</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                  {task.assignedTo?.name?.[0] || 'U'}
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{task.assignedTo?.name}</p>
                  <p className="text-[10px] text-slate-500">{task.assignedTo?.email}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium">Project Container</p>
              <p className="font-semibold text-slate-800 mt-1 truncate">
                {task.project?.title || 'General'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Estimated: {task.estimatedHours} hrs · Logged: {task.actualHours || 0} hrs
              </p>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {task.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Comments Section (Requirement 4: Comment CRUD) */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Discussion & Notes ({comments.length})</span>
            </h3>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic py-2">
                  No comments yet. Leave a note below for the project team.
                </p>
              ) : (
                comments.map((comm) => (
                  <div
                    key={comm._id}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-semibold text-slate-800">{comm.user?.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comm.createdAt).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{comm.message}</p>
                    </div>

                    {(comm.user?._id === user?._id || hasRole(['Admin', 'Project Manager'])) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comm._id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Controlled Form for New Comment */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write an internal comment or status update..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={submittingComment}
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>

        </div>
      )}
    </Modal>
  );
}
