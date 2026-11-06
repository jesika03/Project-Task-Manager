import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api.js';
import {
  BarChart3,
  Printer,
  Calendar,
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { LoadingSpinner, FeedbackBanner } from '../components/FeedbackBanner.jsx';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/reports/summary');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate analytical reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LoadingSpinner text="Computing project metrics and task analytics..." />
      </div>
    );
  }

  const { metrics, statusDistribution, priorityDistribution, projectReports, memberWorkload, overdueItems } =
    data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      
      {/* Header with Print / Export action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Project & Task Analytics Report</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Requirement #8: Summary breakdown, overdue work audit, and team member workload
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs print:hidden"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      <FeedbackBanner type="error" message={error} onDismiss={() => setError('')} />

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-slate-500 text-xs font-medium">Projects Tracked</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {metrics?.totalProjects || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics?.activeProjects} active · {metrics?.completedProjects} completed
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-slate-500 text-xs font-medium">Total Work Packages</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {metrics?.totalTasks || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics?.completedTasks} delivered successfully
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-slate-500 text-xs font-medium">Overdue Bottlenecks</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-rose-600 mt-1">
            {metrics?.overdueCount || 0}
          </p>
          <p className="text-[11px] text-rose-700 mt-1">
            {metrics?.overdueCount > 0 ? 'Past deadline' : 'Zero overdue work'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-slate-500 text-xs font-medium">Overall Progress</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-indigo-600 mt-1">
            {metrics?.completionRate || 0}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across all college teams
          </p>
        </div>
      </div>

      {/* Distribution Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Task Status Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <span>Task Status Breakdown</span>
          </h2>

          <div className="space-y-3">
            {Object.entries(statusDistribution || {}).map(([st, count]) => {
              const pct = metrics?.totalTasks > 0 ? Math.round((count / metrics.totalTasks) * 100) : 0;
              return (
                <div key={st} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span className="font-semibold">{st}</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        st === 'Completed'
                          ? 'bg-emerald-500'
                          : st === 'In Progress'
                          ? 'bg-sky-500'
                          : st === 'Review'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Priority Allocation</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(priorityDistribution || {}).map(([pr, count]) => (
              <div key={pr} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <p className="text-[11px] text-slate-500 font-medium">{pr} Priority</p>
                <p className="text-xl font-bold font-mono tabular-nums text-slate-800 mt-1">
                  {count}
                </p>
                <div className="mt-1">
                  <PriorityBadge priority={pr} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Project Progress Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-3">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <FolderKanban className="w-4 h-4 text-indigo-600" />
            <span>Project Progress Records</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Project Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tasks (Done/Total)</th>
                <th className="px-4 py-3">Overdue</th>
                <th className="px-5 py-3">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projectReports?.map((proj) => (
                <tr key={proj._id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {proj.title}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{proj.category}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={proj.status} />
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums text-slate-700">
                    {proj.completedTasks} / {proj.totalTasks}
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums">
                    {proj.overdueTasks > 0 ? (
                      <span className="text-rose-600 font-bold">{proj.overdueTasks}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${proj.progress}%` }}
                        ></div>
                      </div>
                      <span className="font-mono tabular-nums font-semibold text-slate-700">
                        {proj.progress}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Member Workload Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-3">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Team Member Workload Allocation</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Team Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Total Assigned</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberWorkload?.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-900">{m.name}</p>
                    <p className="text-[10px] text-slate-400">{m.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-medium">{m.role}</td>
                  <td className="px-4 py-3.5 text-slate-500">{m.department}</td>
                  <td className="px-4 py-3.5 font-mono tabular-nums text-slate-800 font-semibold">
                    {m.totalAssigned}
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums text-emerald-600 font-semibold">
                    {m.completed}
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums text-slate-600">
                    {m.pending}
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums">
                    {m.overdue > 0 ? (
                      <span className="text-rose-600 font-bold">{m.overdue}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
