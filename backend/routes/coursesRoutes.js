import express from 'express';
import authenticate from '../middleware/authMiddleware.js';
import { getCourses, getCourse, getInstructorCourses, addCourse, removeCourse, editCourse, getPublished, getEnrolledStudentsByCourse, updateCourseLessonAssignments } from "../controllers/courseControllers.js"

const router = express.Router();

router.get("/", getCourses);
router.get("/published", getPublished);
router.get("/instructor", authenticate, getInstructorCourses);
// router.get("/instructor/:id", getInstructorCourses);
router.get("/instructor/:id", getCourse);
router.post("/", addCourse);
router.delete("/:id", removeCourse);
router.put("/:id", editCourse);
router.get("/enrolled-students/:courseCode", getEnrolledStudentsByCourse);
router.get("/enrolled-students", getEnrolledStudentsByCourse);
router.put("/:courseCode/lessons", updateCourseLessonAssignments);

export default router;