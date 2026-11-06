import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../services/api.js';
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  BarChart3,
  Plus,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  Calendar,
  Activity as ActivityIcon,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { LoadingSpinner, FeedbackBanner } from '../components/FeedbackBanner.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [reportsRes, projRes, overdueRes, actRes] = await Promise.all([
        apiFetch('/reports/summary'),
        apiFetch('/projects?limit=4&sortBy=createdAt&sortOrder=desc'),
        apiFetch('/tasks/overdue'),
        apiFetch('/activities?limit=6'),
      ]);

      if (reportsRes.success) setMetrics(reportsRes.data.metrics);
      if (projRes.success) setProjects(projRes.data);
      if (overdueRes.success) setOverdueTasks(overdueRes.data);
      if (actRes.success) setActivities(actRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LoadingSpinner text="Loading project dashboard & metrics..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Role Greeting */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Role: {user?.role}</span>
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">{user?.department || 'Engineering'}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {user?.role === 'Admin' && 'System Admin mode: Full management over Users, Projects, Tasks, and Audit Logs.'}
            {user?.role === 'Project Manager' && 'Project Manager mode: Plan projects, allocate members, assign tasks, and monitor overdue deadlines.'}
            {user?.role === 'Team Member' && 'Team Member mode: Review assigned tasks, update work statuses, and participate in project comments.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {(user?.role === 'Admin' || user?.role === 'Project Manager') && (
            <Link
              to="/projects"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </Link>
          )}
          <Link
            to="/tasks"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Tasks</span>
          </Link>
        </div>
      </div>

      <FeedbackBanner type="error" message={error} onDismiss={() => setError('')} />

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Projects */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Total Projects</span>
            <FolderKanban className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {metrics?.totalProjects || 0}
          </p>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">{metrics?.activeProjects || 0}</span>
            <span>active in progress</span>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Total Tasks</span>
            <CheckSquare className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {metrics?.totalTasks || 0}
          </p>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">{metrics?.completedTasks || 0}</span>
            <span>completed ·</span>
            <span className="font-semibold text-sky-600">{metrics?.inProgressTasks || 0}</span>
            <span>ongoing</span>
          </div>
        </div>

        {/* Overdue Tasks (Crucial Requirement from Image) */}
        <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 text-xs font-semibold mb-2">
            <span>Overdue Work</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-rose-600">
            {metrics?.overdueCount || 0}
          </p>
          <div className="mt-2 text-[11px] text-rose-700 font-medium">
            <Link to="/overdue" className="hover:underline flex items-center gap-1">
              <span>Immediate review required</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Completion Rate</span>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {metrics?.completionRate || 0}%
          </p>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${metrics?.completionRate || 0}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Main Grid: Projects & Overdue Work */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-600" />
              <span>Recent Projects</span>
            </h2>
            <Link
              to="/projects"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View all projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <Link
                key={proj._id}
                to={`/projects/${proj._id}`}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-xs transition-all group block"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {proj.title}
                  </h3>
                  <StatusBadge status={proj.status} />
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {proj.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                    <span>Task Progress</span>
                    <span className="font-mono tabular-nums">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full"
                      style={{ width: `${proj.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Due {new Date(proj.endDate).toLocaleDateString()}</span>
                  </div>
                  <PriorityBadge priority={proj.priority} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Overdue Watchlist & Recent Activity */}
        <div className="space-y-6">
          
          {/* Overdue Alert Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Overdue Attention ({overdueTasks.length})</span>
              </h2>
              <Link to="/overdue" className="text-[11px] font-semibold text-rose-600 hover:underline">
                View All
              </Link>
            </div>

            {overdueTasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No overdue tasks. All projects on schedule!
              </p>
            ) : (
              <div className="space-y-2.5">
                {overdueTasks.slice(0, 3).map((task) => (
                  <div
                    key={task._id}
                    className="p-3 bg-rose-50/60 border border-rose-100 rounded-lg text-xs"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <p className="font-semibold text-slate-900 line-clamp-1">{task.title}</p>
                      <span className="font-mono text-[10px] text-rose-700 font-bold shrink-0">
                        +{task.daysOverdue}d overdue
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {task.project?.title} · Assigned to {task.assignedTo?.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Stream */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ActivityIcon className="w-4 h-4 text-indigo-600" />
                <span>Recent System Activities</span>
              </h2>
              <Link to="/activities" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                Full Log
              </Link>
            </div>

            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act._id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {act.details}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {act.user?.name || 'System'}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
