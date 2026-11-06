import express from 'express';
import { deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.delete('/:id', deleteComment);

export default router;
