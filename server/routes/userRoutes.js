import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect); // all user routes require authentication

router.route('/')
  .get(getUsers)
  .post(authorize('Admin'), createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(authorize('Admin'), deleteUser);

export default router;
