import express from 'express';
import authRoutes from './authRoutes.js';
import lessonsRoutes from './lessonsRoutes.js';
import coursesRoutes from './coursesRoutes.js';
import studentsRoutes from './studentsRoutes.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/lessons', authenticate, lessonsRoutes);
router.use('/courses', authenticate, coursesRoutes);
router.use('/students', authenticate, studentsRoutes);

export default router;