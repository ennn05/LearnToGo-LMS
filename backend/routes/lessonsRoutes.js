import express from 'express';
import { getLessons } from '../controllers/lessonControllers.js';

const router = express.Router();

router.get("/", getLessons);

export default router;
