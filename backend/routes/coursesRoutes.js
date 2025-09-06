import express from 'express';
import { getCourses, getCourse, getInstructorCourses } from "../controllers/courseControllers.js"

const router = express.Router();

router.get("/", getCourses);
router.get("/instructor", getInstructorCourses);
// router.get("/instructor/:id", getInstructorCourses);
router.get("/instructor/:id", getCourse);

export default router;