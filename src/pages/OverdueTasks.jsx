import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../services/api.js';
import {
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Flame,
  Search,
  Filter,
} from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import {
  FeedbackBanner,
  EmptyState,
  LoadingSpinner,
} from '../components/FeedbackBanner.jsx';

export default function OverdueTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [search, setSearch] = useState('');

  const fetchOverdue = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/tasks/overdue');
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load overdue tasks.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const handleResolve = async (taskId) => {
    try {
      const res = await apiFetch(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Completed' }),
      });
      if (res.success) {
        setFeedback({ type: 'success', message: 'Task marked as Completed! Overdue resolved.' });
        fetchOverdue();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.project?.title?.toLowerCase().includes(q) ||
      t.assignedTo?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Alert Header Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-rose-900 tracking-tight">
                Overdue Work Tracking
              </h1>
              <span className="font-mono text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                {tasks.length} Overdue Items
              </span>
            </div>
            <p className="text-xs text-rose-700 mt-1 max-w-2xl leading-relaxed">
              These tasks have exceeded their specified due dates without being marked Completed. 
              Assignees and project leads must coordinate immediate status updates or completion handoffs.
            </p>
          </div>
        </div>

        <Link
          to="/reports"
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-rose-200 text-rose-800 hover:bg-rose-100/50 transition-colors shadow-xs"
        >
          <span>View Progress Reports</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <FeedbackBanner
        type={feedback.type}
        message={feedback.message}
        onDismiss={() => setFeedback({ type: '', message: '' })}
      />

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter overdue tasks by title, project, or member..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Analyzing overdue deliverables..." />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Zero Overdue Tasks!"
          description="All project deliverables are currently operating within their scheduled timelines."
          actionText="View All Tasks"
          onAction={() => window.location.href = '/tasks'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className="bg-white border border-rose-200 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono tabular-nums font-bold">+{task.daysOverdue} days overdue</span>
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>

                <Link
                  to={`/tasks?openId=${task._id}`}
                  className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors block mb-1.5"
                >
                  {task.title}
                </Link>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                  {task.description || 'No additional notes provided.'}
                </p>

                <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 mb-4">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Project</span>
                    <span className="font-semibold truncate max-w-[150px]">{task.project?.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Assigned To</span>
                    <span className="font-semibold">{task.assignedTo?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Original Deadline</span>
                    <span className="font-mono tabular-nums text-rose-600 font-bold">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/tasks?openId=${task._id}`}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Open Discussion
                </Link>

                <button
                  type="button"
                  onClick={() => handleResolve(task._id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Done</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
