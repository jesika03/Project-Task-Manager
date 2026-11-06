import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from '../controllers/projectMemberController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('Admin', 'Project Manager'), createProject);

router.route('/:id')
  .get(getProjectById)
  .put(authorize('Admin', 'Project Manager'), updateProject)
  .delete(authorize('Admin', 'Project Manager'), deleteProject);

// Nested Project Member CRUD
router.route('/:projectId/members')
  .get(getProjectMembers)
  .post(authorize('Admin', 'Project Manager'), addProjectMember);

router.route('/:projectId/members/:memberId')
  .delete(authorize('Admin', 'Project Manager'), removeProjectMember);

export default router;
