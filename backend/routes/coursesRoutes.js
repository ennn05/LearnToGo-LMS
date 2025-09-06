import express from 'express';
import { getCourses, getCourse, getInstructorCourses } from "../controllers/courseControllers.js"

const router = express.Router();

router.get("/", getCourses);
router.get("/instructor", getInstructorCourses);

export default router;