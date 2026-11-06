import express from 'express';
import {
  getTasks,
  getOverdueTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/taskController.js';
import {
  getCommentsByTask,
  createComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(authorize('Admin', 'Project Manager'), createTask);

router.get('/overdue', getOverdueTasks);

router.route('/:id')
  .get(getTaskById)
  .put(authorize('Admin', 'Project Manager'), updateTask)
  .delete(authorize('Admin', 'Project Manager'), deleteTask);

// Status transition accessible to team members
router.patch('/:id/status', updateTaskStatus);

// Nested comments endpoints
router.route('/:taskId/comments')
  .get(getCommentsByTask)
  .post(createComment);

export default router;
