import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getCourses, getCourse, getInstructorCourses, addCourse, removeCourse, editCourse, getPublished, getEnrolledStudentsByCourse, getStudentCourses, getAvailableCoursesForEnrollment, enrollCourse, unenrollCourse, updateCourseLessonAssignments } from "../controllers/courseControllers.js"

const router = express.Router();

router.get("/", authenticate, (req, res) => {
    switch (req?.user?.role) {
        case "student":
            return getStudentCourses(req, res);
        case "instructor":
        case "admin":
            return getCourses(req, res);
        default:
            return res.status(403).json({ message: "Unauthorized" });
    }
});

router.get("/available", authenticate, authorize("student"), getAvailableCoursesForEnrollment);
router.post("/:courseCode/enroll", authenticate, authorize("student"), enrollCourse);

router.get("/published", getPublished);
router.get("/instructor", authenticate, getInstructorCourses);
// router.get("/instructor/:id", getInstructorCourses);
router.get("/:id", getCourse);
router.post("/", addCourse);
router.delete("/:id", removeCourse);
router.put("/:id", editCourse);
router.get("/enrolled-students/:courseCode", getEnrolledStudentsByCourse);
router.get("/enrolled-students", getEnrolledStudentsByCourse);
router.put("/:courseCode/lessons", updateCourseLessonAssignments);
router.get("/available", authenticate, authorize("student"), getAvailableCoursesForEnrollment);
router.post("/:courseCode/enroll", authenticate, authorize("student"), enrollCourse);
router.delete("/:courseCode/enroll", authenticate, authorize("student"), unenrollCourse); 

export default router;