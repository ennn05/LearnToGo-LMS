import express from 'express';
import { getCourses, getCourse, getInstructorCourses, addCourse } from "../controllers/courseControllers.js"

const router = express.Router();

router.get("/", getCourses);
router.get("/instructor", getInstructorCourses);
// router.get("/instructor/:id", getInstructorCourses);
router.get("/instructor/:id", getCourse);
router.post("/", addCourse)

export default router;