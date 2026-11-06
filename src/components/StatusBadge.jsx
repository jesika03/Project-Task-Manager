import React from 'react';
import { Circle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, isOverdue = false }) {
  if (isOverdue && status !== 'Completed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Overdue</span>
      </span>
    );
  }

  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Completed</span>
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700">
          <Clock className="w-3.5 h-3.5 text-sky-600 animate-spin-slow" />
          <span>In Progress</span>
        </span>
      );
    case 'Review':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
          <Circle className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Review</span>
        </span>
      );
    case 'Planning':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700">
          <Circle className="w-3.5 h-3.5 text-purple-400" />
          <span>Planning</span>
        </span>
      );
    case 'Active':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <Circle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
          <span>Active</span>
        </span>
      );
    case 'On Hold':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Circle className="w-3.5 h-3.5 text-slate-400" />
          <span>On Hold</span>
        </span>
      );
    case 'Todo':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <Circle className="w-3.5 h-3.5 text-slate-400" />
          <span>Todo</span>
        </span>
      );
  }
}
