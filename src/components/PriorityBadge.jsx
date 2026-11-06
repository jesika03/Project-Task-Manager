import React from 'react';
import { ArrowUp, ArrowDown, Minus, Flame } from 'lucide-react';

export default function PriorityBadge({ priority }) {
  switch (priority) {
    case 'Urgent':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
          <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-100" />
          <span>Urgent</span>
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
          <ArrowUp className="w-3.5 h-3.5 text-amber-600" />
          <span>High</span>
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
          <Minus className="w-3.5 h-3.5 text-blue-500" />
          <span>Medium</span>
        </span>
      );
    case 'Low':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
          <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Low</span>
        </span>
      );
  }
}
