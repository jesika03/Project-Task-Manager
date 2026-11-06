import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../services/api.js';
import {
  FileCode,
  Database,
  CheckCircle2,
  Key,
  Download,
  Copy,
  Layers,
  Shield,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { FeedbackBanner } from '../components/FeedbackBanner.jsx';

export default function SubmissionDocs() {
  const { user, quickLogin } = useAuth();
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Postman Collection JSON Definition
  const postmanCollection = {
    info: {
      name: 'Project and Task Management API - Internal Evaluation (Project #15)',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      description: 'Complete API endpoints for Authentication, Users, Projects, Members, Tasks, Comments, Activities, and Reports.',
    },
    item: [
      {
        name: 'Auth',
        item: [
          { name: 'POST /api/auth/register', request: { method: 'POST', url: '{{baseUrl}}/api/auth/register' } },
          { name: 'POST /api/auth/login', request: { method: 'POST', url: '{{baseUrl}}/api/auth/login' } },
          { name: 'GET /api/auth/me', request: { method: 'GET', url: '{{baseUrl}}/api/auth/me' } },
        ],
      },
      {
        name: 'Projects',
        item: [
          { name: 'GET /api/projects', request: { method: 'GET', url: '{{baseUrl}}/api/projects' } },
          { name: 'POST /api/projects', request: { method: 'POST', url: '{{baseUrl}}/api/projects' } },
          { name: 'GET /api/projects/:id', request: { method: 'GET', url: '{{baseUrl}}/api/projects/:id' } },
          { name: 'PUT /api/projects/:id', request: { method: 'PUT', url: '{{baseUrl}}/api/projects/:id' } },
          { name: 'DELETE /api/projects/:id', request: { method: 'DELETE', url: '{{baseUrl}}/api/projects/:id' } },
          { name: 'POST /api/projects/:id/members', request: { method: 'POST', url: '{{baseUrl}}/api/projects/:id/members' } },
          { name: 'DELETE /api/projects/:id/members/:memberId', request: { method: 'DELETE', url: '{{baseUrl}}/api/projects/:id/members/:memberId' } },
        ],
      },
      {
        name: 'Tasks',
        item: [
          { name: 'GET /api/tasks', request: { method: 'GET', url: '{{baseUrl}}/api/tasks' } },
          { name: 'POST /api/tasks', request: { method: 'POST', url: '{{baseUrl}}/api/tasks' } },
          { name: 'GET /api/tasks/overdue', request: { method: 'GET', url: '{{baseUrl}}/api/tasks/overdue' } },
          { name: 'PATCH /api/tasks/:id/status', request: { method: 'PATCH', url: '{{baseUrl}}/api/tasks/:id/status' } },
          { name: 'GET /api/tasks/:id/comments', request: { method: 'GET', url: '{{baseUrl}}/api/tasks/:id/comments' } },
          { name: 'POST /api/tasks/:id/comments', request: { method: 'POST', url: '{{baseUrl}}/api/tasks/:id/comments' } },
        ],
      },
      {
        name: 'Reports & Audit',
        item: [
          { name: 'GET /api/reports/summary', request: { method: 'GET', url: '{{baseUrl}}/api/reports/summary' } },
          { name: 'GET /api/activities', request: { method: 'GET', url: '{{baseUrl}}/api/activities' } },
        ],
      },
    ],
  };

  const postmanString = JSON.stringify(postmanCollection, null, 2);

  const handleCopyPostman = () => {
    navigator.clipboard.writeText(postmanString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPostman = () => {
    const blob = new Blob([postmanString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Project15_TaskManagement_Postman_Collection.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset database back to initial seed data records?')) return;
    setResetting(true);
    try {
      const res = await apiFetch('/auth/reset-demo', { method: 'POST' });
      if (res.success) {
        setFeedback({ type: 'success', message: 'Database successfully reset to pristine demo records!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            College Internal Evaluation Project
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-600" />
            <span>Submission Documentation & ER Diagram</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Project #15 · ReactJS (Vite) + Node.js Express + MongoDB / Mongoose + JWT
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDatabase}
          disabled={resetting}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{resetting ? 'Resetting DB...' : 'Reset Demo Seed Data'}</span>
        </button>
      </div>

      <FeedbackBanner
        type={feedback.type}
        message={feedback.message}
        onDismiss={() => setFeedback({ type: '', message: '' })}
      />

      {/* 1. Requirements Compliance Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Evaluation Rubric & Functional Compliance Checklist</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            {
              id: '1',
              title: 'Authentication',
              desc: 'Registration, login, logout, JWT-protected APIs and bcrypt password hashing.',
              status: 'Implemented',
            },
            {
              id: '2',
              title: 'Role Access',
              desc: 'Admin, Project Manager, and Team Member with role middleware protection.',
              status: 'Implemented',
            },
            {
              id: '3',
              title: 'Core Workflow',
              desc: 'Create projects, add members, assign tasks, set priorities/due dates, add comments, track progress, show overdue work.',
              status: 'Implemented',
            },
            {
              id: '4',
              title: 'Data Management',
              desc: 'Full CRUD screens & Express APIs for User, Project, ProjectMember, Task, Comment, Activity.',
              status: 'Implemented',
            },
            {
              id: '5',
              title: 'List Features',
              desc: 'Search, multi-criteria filters, pagination, and sorting for main records.',
              status: 'Implemented',
            },
            {
              id: '6',
              title: 'Validation',
              desc: 'Required fields validated in React controlled forms (e.preventDefault()) and again in Express API.',
              status: 'Implemented',
            },
            {
              id: '7',
              title: 'Feedback States',
              desc: 'Loading spinners, empty states, success alerts, and error feedback across all operations.',
              status: 'Implemented',
            },
            {
              id: '8',
              title: 'Reports',
              desc: 'Analytical summary of tasks, overdue work, status breakdown, project progress records, and workload.',
              status: 'Implemented',
            },
          ].map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
                    {item.id}
                  </span>
                  <p className="font-bold text-slate-800">{item.title}</p>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Interactive Entity Relationship Diagram (ERD) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
          <Database className="w-4 h-4 text-indigo-600" />
          <span>Entity Relationship Diagram (ERD) & Mongoose Schema Architecture</span>
        </h2>
        <p className="text-xs text-slate-500">
          Visual representation of the 6 core Mongoose models, their schemas, data types, indexes, and relational references.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* User Model Card */}
          <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50/20 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
              <span className="font-bold text-indigo-900">User (Model)</span>
              <span className="text-[10px] font-mono text-indigo-600">Primary Entity</span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-slate-700">
              <li><span className="text-indigo-600">_id:</span> ObjectId (PK)</li>
              <li><span className="text-indigo-600">name:</span> String (required)</li>
              <li><span className="text-indigo-600">email:</span> String (unique, index)</li>
              <li><span className="text-indigo-600">password:</span> String (bcrypt hash)</li>
              <li><span className="text-indigo-600">role:</span> Enum [Admin, PM, Member]</li>
              <li><span className="text-indigo-600">department:</span> String</li>
              <li><span className="text-indigo-600">timestamps:</span> createdAt, updatedAt</li>
            </ul>
          </div>

          {/* Project Model Card */}
          <div className="border border-sky-200 rounded-lg p-4 bg-sky-50/20 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-sky-100 pb-2">
              <span className="font-bold text-sky-900">Project (Model)</span>
              <span className="text-[10px] font-mono text-sky-600">Container Entity</span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-slate-700">
              <li><span className="text-sky-600">_id:</span> ObjectId (PK)</li>
              <li><span className="text-sky-600">title:</span> String (required)</li>
              <li><span className="text-sky-600">description:</span> String</li>
              <li><span className="text-sky-600">category:</span> Enum [Web, Mobile, Cloud...]</li>
              <li><span className="text-sky-600">status:</span> Enum [Active, Planning...]</li>
              <li><span className="text-sky-600">priority:</span> Enum [Low, Med, High, Urgent]</li>
              <li><span className="text-sky-600">createdBy:</span> ObjectId (FK -&gt; User)</li>
              <li><span className="text-sky-600">startDate / endDate:</span> Date (index)</li>
              <li><span className="text-sky-600">budget:</span> Number</li>
            </ul>
          </div>

          {/* ProjectMember Model Card */}
          <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/20 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2">
              <span className="font-bold text-amber-900">ProjectMember (Model)</span>
              <span className="text-[10px] font-mono text-amber-600">Junction Entity</span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-slate-700">
              <li><span className="text-amber-600">_id:</span> ObjectId (PK)</li>
              <li><span className="text-amber-600">project:</span> ObjectId (FK -&gt; Project)</li>
              <li><span className="text-amber-600">user:</span> ObjectId (FK -&gt; User)</li>
              <li><span className="text-amber-600">roleInProject:</span> Enum [Lead, Dev, QA...]</li>
              <li><span className="text-amber-600">joinedAt:</span> Date</li>
              <li className="text-[10px] text-slate-500 pt-1 italic">
                * Compound unique index on (project, user)
              </li>
            </ul>
          </div>

          {/* Task Model Card */}
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/20 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-purple-100 pb-2">
              <span className="font-bold text-purple-900">Task (Model)</span>
              <span className="text-[10px] font-mono text-purple-600">Core Work Item</span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-slate-700">
              <li><span className="text-purple-600">_id:</span> ObjectId (PK)</li>
              <li><span className="text-purple-600">title:</span> String (required)</li>
              <li><span className="text-purple-600">project:</span> ObjectId (FK -&gt; Project)</li>
              <li><span className="text-purple-600">assignedTo:</span> ObjectId (FK -&gt; User)</li>
              <li><span className="text-purple-600">createdBy:</span> ObjectId (FK -&gt; User)</li>
              <li><span className="text-purple-600">status:</span> Enum [Todo, Progress, Review, Done]</li>
              <li><span className="text-purple-600">priority:</span> Enum [Low, Med, High, Urgent]</li>
              <li><span className="text-purple-600">dueDate:</span> Date (index, overdue calc)</li>
              <li><span className="text-purple-600">isOverdue:</span> Virtual Boolean</li>
            </ul>
          </div>

          {/* Comment Model Card */}
          <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/20 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <span className="font-bold text-emerald-900">Comment (Model)</span>
              <span className="text-[10px] font-mono text-emerald-600">Discussion Entity</span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-slate-700">
              <li><span className="text-emerald-600">_id:</span> ObjectId (PK)</li>
              <li><span className="text-emerald-600">task:</span> ObjectId (FK -&gt; Task)</li>
              <li><span className="text-emerald-600">user:</span> ObjectId (FK -&gt; User)</li>
              <li><span className="text-emerald-600">message:</span> String (required)</li>
              <li><span className="text-emerald-600">timestamps:</span> createdAt, updatedAt</li>
            </ul>
          </div>

          {/* Activity Model Card */}
          <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900">Activity (Model)</span>
              <span className="text-[10px] font-mono text-slate-600">Audit Trail</span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-slate-700">
              <li><span className="text-slate-600">_id:</span> ObjectId (PK)</li>
              <li><span className="text-slate-600">user:</span> ObjectId (FK -&gt; User)</li>
              <li><span className="text-slate-600">action:</span> String [CREATED, UPDATED...]</li>
              <li><span className="text-slate-600">entityType:</span> Enum [Project, Task, Member...]</li>
              <li><span className="text-slate-600">entityId:</span> String</li>
              <li><span className="text-slate-600">details:</span> String</li>
              <li><span className="text-slate-600">createdAt:</span> Date (index: -1)</li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. Default Credentials Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
          <Key className="w-4 h-4 text-indigo-600" />
          <span>Examiner Demo Credentials & Quick Switch</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Password</th>
                <th className="px-4 py-2.5 text-right">Switch Active Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { role: 'Admin', name: 'Prof. S. Sharma', email: 'admin@college.edu', pass: 'admin123' },
                { role: 'Project Manager', name: 'Rahul Verma', email: 'pm.rahul@college.edu', pass: 'pm12345' },
                { role: 'Team Member', name: 'Priya Sundaram (Dev)', email: 'priya.dev@college.edu', pass: 'dev12345' },
                { role: 'Team Member', name: 'Arjun Nair (QA)', email: 'arjun.qa@college.edu', pass: 'qa12345' },
              ].map((acc) => (
                <tr key={acc.email} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{acc.role}</td>
                  <td className="px-4 py-3 text-slate-700">{acc.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{acc.email}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{acc.pass}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => quickLogin(acc.role === 'Admin' ? 'Admin' : acc.role === 'Project Manager' ? 'Project Manager' : acc.name.includes('QA') ? 'QA Tester' : 'Team Member')}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      Login as {acc.role.split(' ')[0]}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Postman Collection Export */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Postman Collection (v2.1 API Specification)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ready to import into Postman or Insomnia for automated API endpoint grading.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyPostman}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPostman}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .json</span>
            </button>
          </div>
        </div>

        <pre className="p-4 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono max-h-56 overflow-y-auto">
          {postmanString}
        </pre>
      </div>

    </div>
  );
}
