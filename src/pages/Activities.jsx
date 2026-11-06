import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api.js';
import {
  Activity as ActivityIcon,
  Search,
  Filter,
  Clock,
  User,
  Shield,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import Pagination from '../components/Pagination.jsx';
import {
  FeedbackBanner,
  EmptyState,
  LoadingSpinner,
} from '../components/FeedbackBanner.jsx';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [error, setError] = useState('');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit: 12,
        search,
        entityType: entityFilter,
      }).toString();

      const res = await apiFetch(`/activities?${query}`);
      if (res.success) {
        setActivities(res.data);
        setTotal(res.total);
        setPages(res.pages);
      }
    } catch (err) {
      setError(err.message || 'Failed to load activities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, search, entityFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-indigo-600" />
          <span>System Activity Audit Trail</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Requirement #4: Real-time event log of project mutations, task transitions, and member activities
        </p>
      </div>

      <FeedbackBanner type="error" message={error} onDismiss={() => setError('')} />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search event details..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Entity Categories</option>
              <option value="Project">Project Events</option>
              <option value="Task">Task Events</option>
              <option value="Member">Team Member Events</option>
              <option value="Comment">Discussion Comments</option>
              <option value="User">User Account Events</option>
            </select>
          </div>

        </div>
      </div>

      {/* Activity Timeline List */}
      {loading ? (
        <LoadingSpinner text="Fetching audit trail..." />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title="No Activities Logged"
          description="Actions taken by team members will be recorded automatically here."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="space-y-4">
            {activities.map((act) => (
              <div
                key={act._id}
                className="flex items-start gap-3.5 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                  {act.user?.name?.[0] || 'U'}
                </div>

                <div className="flex-1 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <p className="font-semibold text-slate-900">
                      {act.details}
                    </p>
                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(act.createdAt).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Initiated by {act.user?.name || 'System'}</span>
                    <span>·</span>
                    <span className="font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                      {act.entityType}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-slate-400 text-[10px]">ID: {act.entityId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        pages={pages}
        total={total}
        onPageChange={(p) => setPage(p)}
        label="activities"
      />

    </div>
  );
}
