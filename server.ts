/**
 * Project and Task Management (Project #15)
 * Full-Stack Node.js Express Server with Mongoose & Vite Integration
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getDBStatus } from './server/config/db.js';
import { seedInitialData } from './server/utils/mockStore.js';
import { errorHandler } from './server/middleware/errorHandler.js';

import authRoutes from './server/routes/authRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import projectRoutes from './server/routes/projectRoutes.js';
import taskRoutes from './server/routes/taskRoutes.js';
import commentRoutes from './server/routes/commentRoutes.js';
import activityRoutes from './server/routes/activityRoutes.js';
import reportRoutes from './server/routes/reportRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database & Seed Demo Data
connectDB().then(() => {
  seedInitialData();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/reports', reportRoutes);

// System Status Endpoint
app.get('/api/system/status', (req, res) => {
  res.json({
    success: true,
    projectNumber: 15,
    projectName: 'Project and Task Management',
    status: 'Operational',
    database: getDBStatus(),
    rolesSupported: ['Admin', 'Project Manager', 'Team Member'],
    mongooseModels: ['User', 'Project', 'ProjectMember', 'Task', 'Comment', 'Activity'],
  });
});

// Central Error Handler
app.use(errorHandler);

// Vite Integration (Dev middleware or Production static files)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Project & Task Management server listening on port ${PORT}`);
  });
}

startServer();
