import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  BarChart3,
  Users,
  FileCode,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Shield,
  Activity,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userDropdown, setUserDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Overdue', path: '/overdue', icon: AlertTriangle },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Activities', path: '/activities', icon: Activity },
    { name: 'Submission Package', path: '/submission', icon: FileCode },
  ];

  if (user?.role === 'Admin') {
    navLinks.splice(5, 0, { name: 'User Directory', path: '/users', icon: Users });
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              15
            </span>
            <span>TaskPilot</span>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 py-1 transition-colors ${
                    active
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 -mb-[2px]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: User Profile & Actions */}
          <div className="flex items-center gap-3 shrink-0 relative">
            <div
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center gap-2.5 p-1 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <img
                src={
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`
                }
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
              />
              <div className="hidden sm:block text-left text-xs leading-tight">
                <p className="font-semibold text-slate-900 truncate max-w-[120px]">{user?.name}</p>
                <p className="text-slate-500 text-[11px] font-medium">{user?.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {userDropdown && (
              <div
                className="absolute right-0 top-12 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 text-sm z-50 animate-in fade-in duration-150"
                onClick={() => setUserDropdown(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-medium text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                    <Shield className="w-3 h-3" />
                    <span>Role: {user?.role}</span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/submission"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-xs"
                  >
                    <FileCode className="w-4 h-4 text-slate-400" />
                    <span>Submission Docs & ERD</span>
                  </Link>
                  <Link
                    to="/activities"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-xs"
                  >
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span>Audit Activity Log</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Mobile secondary nav strip */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-2.5 border-t border-slate-100 text-xs">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`whitespace-nowrap px-2.5 py-1 rounded transition-colors ${
                  active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
}
