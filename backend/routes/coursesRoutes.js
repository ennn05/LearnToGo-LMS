import express from 'express';
import { getCourses, getCourse, getInstructorCourses, addCourse, removeCourse } from "../controllers/courseControllers.js"

const router = express.Router();

router.get("/", getCourses);
router.get("/instructor", getInstructorCourses);
// router.get("/instructor/:id", getInstructorCourses);
router.get("/instructor/:id", getCourse);
router.post("/", addCourse);
router.delete("/:id", removeCourse);

export default router;