import express from 'express';
import authRoutes from './authRoutes.js';
import lessonsRoutes from './lessonsRoutes.js';
import coursesRoutes from './coursesRoutes.js';
import studentsRoutes from './studentsRoutes.js';
import classroomsRoutes from './classroomRoutes.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

// router.use('/auth', authRoutes);
// router.use('/lessons', authenticate, lessonsRoutes);
// router.use('/courses', authenticate, coursesRoutes);
// router.use('/students', authenticate, studentsRoutes);


router.use('/auth', authRoutes);
router.use('/lessons', lessonsRoutes);
router.use('/courses', coursesRoutes);
router.use('/students', studentsRoutes);
router.use('/classrooms', classroomsRoutes);

export default router;