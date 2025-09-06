import express from 'express';
import { getCourses, getCourse, getInstructorCourses, addCourse, removeCourse, editCourse } from "../controllers/courseControllers.js"

const router = express.Router();

router.get("/", getCourses);
router.get("/instructor", getCourses);
// router.get("/instructor/:id", getInstructorCourses);
router.get("/instructor/:id", getCourse);
router.post("/", addCourse);
router.delete("/:id", removeCourse);
router.put("/:id", editCourse);

export default router;