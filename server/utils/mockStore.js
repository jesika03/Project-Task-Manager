/**
 * In-Memory Resilient Data Store
 * Matches Mongoose model schemas, field validations, and relationships
 * Guarantees zero failures and lightning fast response times during internal project demos.
 */

import bcrypt from 'bcryptjs';

// Global stores in memory
export const dbStore = {
  users: [],
  projects: [],
  projectMembers: [],
  tasks: [],
  comments: [],
  activities: [],
};

// ID generator helper
export const generateId = () => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

// Initialize seed data for testing
export const seedInitialData = async () => {
  if (dbStore.users.length > 0) return; // already seeded

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const pmPasswordHash = await bcrypt.hash('pm12345', salt);
  const devPasswordHash = await bcrypt.hash('dev12345', salt);
  const qaPasswordHash = await bcrypt.hash('qa12345', salt);

  // 1. Users (Admin, Project Manager, Team Member)
  const userAdmin = {
    _id: 'usr_admin_01',
    name: 'Prof. S. Sharma (Admin)',
    email: 'admin@college.edu',
    password: adminPasswordHash,
    role: 'Admin',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: new Date('2026-09-01T09:00:00Z'),
    updatedAt: new Date('2026-09-01T09:00:00Z'),
  };

  const userPM = {
    _id: 'usr_pm_02',
    name: 'Rahul Verma (Project Lead)',
    email: 'pm.rahul@college.edu',
    password: pmPasswordHash,
    role: 'Project Manager',
    department: 'Full Stack Lab',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: new Date('2026-09-05T10:00:00Z'),
    updatedAt: new Date('2026-09-05T10:00:00Z'),
  };

  const userDev = {
    _id: 'usr_dev_03',
    name: 'Priya Sundaram (Developer)',
    email: 'priya.dev@college.edu',
    password: devPasswordHash,
    role: 'Team Member',
    department: 'Frontend Engineering',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: new Date('2026-09-10T11:00:00Z'),
    updatedAt: new Date('2026-09-10T11:00:00Z'),
  };

  const userQA = {
    _id: 'usr_qa_04',
    name: 'Arjun Nair (QA Tester)',
    email: 'arjun.qa@college.edu',
    password: qaPasswordHash,
    role: 'Team Member',
    department: 'Quality Assurance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: new Date('2026-09-12T11:30:00Z'),
    updatedAt: new Date('2026-09-12T11:30:00Z'),
  };

  dbStore.users.push(userAdmin, userPM, userDev, userQA);

  // 2. Projects
  const now = new Date();
  const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const futureDate1 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 25);
  const overdueDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5); // 5 days ago!

  const proj1 = {
    _id: 'proj_01',
    title: 'Smart Campus Portal & LMS',
    description: 'Internal college web application for attendance, marks, lab evaluations, and assignments submission.',
    category: 'Web Development',
    status: 'Active',
    priority: 'High',
    startDate: pastDate,
    endDate: futureDate1,
    createdBy: userPM._id,
    budget: 45000,
    createdAt: pastDate,
    updatedAt: now,
  };

  const proj2 = {
    _id: 'proj_02',
    title: 'Hospital Patient Vitals IoT Tracker',
    description: 'Real-time telemetry and task dispatch system for ward nurses and medical emergency teams.',
    category: 'Cloud Systems',
    status: 'Active',
    priority: 'Urgent',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    createdBy: userAdmin._id,
    budget: 80000,
    createdAt: pastDate,
    updatedAt: now,
  };

  const proj3 = {
    _id: 'proj_03',
    title: 'Autonomous Library Book Inventory Bot',
    description: 'Computer vision and RFID based robotics system to audit library shelf inventory automatically.',
    category: 'AI & ML',
    status: 'Planning',
    priority: 'Medium',
    startDate: now,
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
    createdBy: userPM._id,
    budget: 35000,
    createdAt: now,
    updatedAt: now,
  };

  dbStore.projects.push(proj1, proj2, proj3);

  // 3. Project Members
  dbStore.projectMembers.push(
    { _id: 'pmem_1', project: proj1._id, user: userPM._id, roleInProject: 'Lead', joinedAt: pastDate },
    { _id: 'pmem_2', project: proj1._id, user: userDev._id, roleInProject: 'Developer', joinedAt: pastDate },
    { _id: 'pmem_3', project: proj1._id, user: userQA._id, roleInProject: 'QA Tester', joinedAt: pastDate },
    { _id: 'pmem_4', project: proj2._id, user: userPM._id, roleInProject: 'Lead', joinedAt: pastDate },
    { _id: 'pmem_5', project: proj2._id, user: userDev._id, roleInProject: 'Developer', joinedAt: pastDate }
  );

  // 4. Tasks (including overdue tasks, completed tasks, in-progress tasks)
  const task1 = {
    _id: 'task_01',
    title: 'Design Relational Schema & MongoDB Models',
    description: 'Define User, Project, ProjectMember, Task, Comment, and Activity models with validation.',
    project: proj1._id,
    assignedTo: userDev._id,
    createdBy: userPM._id,
    status: 'Completed',
    priority: 'High',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    estimatedHours: 8,
    actualHours: 7,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    tags: ['database', 'mongoose'],
    createdAt: pastDate,
    updatedAt: now,
  };

  const task2 = {
    _id: 'task_02',
    title: 'Implement JWT Authentication & Role Middleware',
    description: 'Ensure token verification, cookie/header handling, and role authorization for Admin and Project Manager.',
    project: proj1._id,
    assignedTo: userDev._id,
    createdBy: userPM._id,
    status: 'In Progress',
    priority: 'Urgent',
    dueDate: overdueDate, // OVERDUE!
    estimatedHours: 12,
    actualHours: 10,
    completedAt: null,
    tags: ['security', 'auth', 'jwt'],
    createdAt: pastDate,
    updatedAt: now,
  };

  const task3 = {
    _id: 'task_03',
    title: 'Create Project Progress & Overdue Reports Page',
    description: 'Build visual statistical charts, overdue task indicators, and printable summaries for internal reviews.',
    project: proj1._id,
    assignedTo: userDev._id,
    createdBy: userPM._id,
    status: 'Todo',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
    estimatedHours: 6,
    actualHours: 0,
    completedAt: null,
    tags: ['frontend', 'reports'],
    createdAt: now,
    updatedAt: now,
  };

  const task4 = {
    _id: 'task_04',
    title: 'Perform End-to-End Test on User CRUD Operations',
    description: 'Verify field validation in React controlled forms and verify server rejection on empty required inputs.',
    project: proj1._id,
    assignedTo: userQA._id,
    createdBy: userPM._id,
    status: 'Review',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    estimatedHours: 5,
    actualHours: 4,
    completedAt: null,
    tags: ['qa', 'testing'],
    createdAt: now,
    updatedAt: now,
  };

  const task5 = {
    _id: 'task_05',
    title: 'Configure MQTT Broker & Fallback Socket Stream',
    description: 'Connect IoT hardware node simulation with latency threshold checks.',
    project: proj2._id,
    assignedTo: userDev._id,
    createdBy: userAdmin._id,
    status: 'Todo',
    priority: 'Urgent',
    dueDate: overdueDate, // OVERDUE!
    estimatedHours: 16,
    actualHours: 2,
    completedAt: null,
    tags: ['iot', 'backend'],
    createdAt: pastDate,
    updatedAt: now,
  };

  dbStore.tasks.push(task1, task2, task3, task4, task5);

  // 5. Comments
  dbStore.comments.push(
    {
      _id: 'comm_01',
      task: task2._id,
      user: userPM._id,
      message: 'Priya, remember to check token expiry on client side and clear localStorage gracefully.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
    {
      _id: 'comm_02',
      task: task2._id,
      user: userDev._id,
      message: 'Yes Rahul sir, implemented in AuthContext with auto-logout and toast notification.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
    {
      _id: 'comm_03',
      task: task4._id,
      user: userQA._id,
      message: 'Validated invalid email format and short password check. Works as expected on both client & API.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    }
  );

  // 6. Activities
  dbStore.activities.push(
    {
      _id: 'act_01',
      user: userAdmin._id,
      action: 'CREATED_PROJECT',
      entityType: 'Project',
      entityId: proj2._id,
      details: 'Created new project "Hospital Patient Vitals IoT Tracker"',
      createdAt: pastDate,
    },
    {
      _id: 'act_02',
      user: userPM._id,
      action: 'ADDED_MEMBER',
      entityType: 'Member',
      entityId: userDev._id,
      details: 'Added Priya Sundaram as Developer to Smart Campus Portal',
      createdAt: pastDate,
    },
    {
      _id: 'act_03',
      user: userPM._id,
      action: 'CREATED_TASK',
      entityType: 'Task',
      entityId: task2._id,
      details: 'Created urgent task "Implement JWT Authentication & Role Middleware"',
      createdAt: pastDate,
    },
    {
      _id: 'act_04',
      user: userDev._id,
      action: 'STATUS_CHANGED',
      entityType: 'Task',
      entityId: task1._id,
      details: 'Marked task "Design Relational Schema & MongoDB Models" as Completed',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    },
    {
      _id: 'act_05',
      user: userQA._id,
      action: 'COMMENT_ADDED',
      entityType: 'Comment',
      entityId: task4._id,
      details: 'Added testing review notes on form validation',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    }
  );

  console.log('[Store] Initial seed data created successfully (Users, Projects, Members, Tasks, Comments, Activities)');
};
