import express from 'express';
import authRoutes from './authRoutes.js';
import lessonsRoutes from './lessonsRoutes.js';
import coursesRoutes from './coursesRoutes.js';
import studentsRoutes from './studentsRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/lessons', lessonsRoutes);
router.use('/courses', coursesRoutes);
router.use('/students', studentsRoutes);

export default router;