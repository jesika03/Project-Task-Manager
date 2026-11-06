# Project #15: Project and Task Management System

A full-stack MERN application built for college internal evaluation, demonstrating role-based access control, relational document modeling in MongoDB via Mongoose, JWT authentication with bcrypt password hashing, project lifecycle workflows, task assignment, progress tracking, and overdue deadline monitoring.

---

## 📌 Project Overview
- **Project Number**: 15
- **Project Name**: Project and Task Management
- **Suggested Roles**: Admin, Project Manager, Team Member
- **Main Mongoose Models**: User, Project, ProjectMember, Task, Comment, Activity

---

## 🚀 Key Features

### 1. Authentication & Security
- User registration and login with JSON Web Tokens (JWT).
- Secure password hashing using `bcryptjs` (salt rounds: 10).
- Role-based authorization middleware (`protect` and `authorize`).
- Client-side token storage in `localStorage` with automatic session recovery.

### 2. Role-Based Access Control (RBAC)
- **Admin**: System-wide control. Full CRUD on Users, Projects, and Tasks. Can reassign roles and monitor full audit logs.
- **Project Manager**: Create and manage projects, add team members to projects, assign tasks, prioritize work, set due dates, and monitor project completion.
- **Team Member**: View assigned projects, update task statuses (Todo ➔ In Progress ➔ Review ➔ Completed), track individual work, and participate in task discussion comments.

### 3. Core Project & Task Workflow
- **Projects**: Title, description, category, start date, target end date, budget, and real-time completion progress tracking.
- **Project Members**: Junction model associating users with designated project roles (`Lead`, `Developer`, `Designer`, `QA Tester`, `Member`) with compound unique indexes to prevent duplicate assignments.
- **Tasks**: Title, description, project link, assignee, priority (`Low`, `Medium`, `High`, `Urgent`), target due date, estimated vs actual hours, and tags.
- **Overdue Work Detection**: Automatic calculation of overdue status and days overdue for non-completed tasks past their due date.
- **Comments**: Task discussions with author identification, timestamps, and delete controls.
- **Activity Log**: Automated audit trail logging creations, status transitions, member assignments, and comments.

### 4. Analytical Reports & Summaries
- Project completion rates and progress tracking.
- Task status breakdown (Todo, In Progress, Review, Completed).
- Priority allocation matrices.
- Team member workload distribution (assigned, completed, pending, overdue).
- Dedicated overdue deliverables audit list with print/PDF export capability.

---

## 🏗️ Technical Stack & Architecture

### Backend (Node.js & Express)
- `server/config/db.js`: Mongoose MongoDB connection with graceful local in-memory fallback.
- `server/models/`: Mongoose schemas with validation and indexes:
  - `User.js`, `Project.js`, `ProjectMember.js`, `Task.js`, `Comment.js`, `Activity.js`.
- `server/middleware/`:
  - `auth.js`: JWT token verification.
  - `role.js`: Role access guard (`authorize`).
  - `errorHandler.js`: Centralized error handler.
- `server/controllers/`: Express business logic, query pagination, sorting, search, and cascading deletions.
- `server/routes/`: Modular REST API endpoints.

### Frontend (React & Vite)
- **Framework**: React 19 with Vite.
- **Routing**: `react-router-dom` v7.
- **State Management**: React Context API (`AuthContext`).
- **Forms**: Controlled components with `e.preventDefault()`, dual-layer validation (React + Express).
- **Styling**: Tailwind CSS v4.
- **Feedback States**: Loading spinners, empty states, success alerts, and error banners.

---

## 🔑 Test Credentials (1-Click Login Supported)

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Prof. S. Sharma | `admin@college.edu` | `admin123` |
| **Project Manager** | Rahul Verma | `pm.rahul@college.edu` | `pm12345` |
| **Team Member (Dev)** | Priya Sundaram | `priya.dev@college.edu` | `dev12345` |
| **Team Member (QA)** | Arjun Nair | `arjun.qa@college.edu` | `qa12345` |

---

## 📡 API Endpoints Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT |
| `GET` | `/api/auth/me` | Private | Retrieve current user profile |
| `GET` | `/api/projects` | Private | Get projects (search, filter, sort, paginate) |
| `POST` | `/api/projects` | Admin/PM | Create new project |
| `GET` | `/api/projects/:id` | Private | Get project details, members, & tasks |
| `POST` | `/api/projects/:id/members` | Admin/PM | Add member to project |
| `DELETE` | `/api/projects/:id/members/:memberId` | Admin/PM | Remove member from project |
| `GET` | `/api/tasks` | Private | Get tasks with search, status, & priority filters |
| `POST` | `/api/tasks` | Admin/PM | Create and assign new task |
| `GET` | `/api/tasks/overdue` | Private | Retrieve all overdue tasks |
| `PATCH` | `/api/tasks/:id/status` | Private | Update task status (Member/PM/Admin) |
| `GET` | `/api/tasks/:id/comments` | Private | Get comments for task |
| `POST` | `/api/tasks/:id/comments` | Private | Post discussion comment |
| `GET` | `/api/reports/summary` | Private | Retrieve comprehensive analytical reports |
| `GET` | `/api/activities` | Private | View audit trail log |

---

## 🛠️ Environment Configuration (.env)
```env
JWT_SECRET="college_internal_project_jwt_secret_key_2026"
MONGODB_URI="mongodb+srv://student:internalmarks2026@cluster0.example.mongodb.net/project_task_db?retryWrites=true&w=majority"
PORT=3000
NODE_ENV="development"
```
