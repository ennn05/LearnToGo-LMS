import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getCourses, getCourse, getInstructorCourses, addCourse, removeCourse, editCourse, getPublished, getEnrolledStudentsByCourse, getStudentCourses, getAvailableCoursesForEnrollment, enrollCourse, unenrollCourse, updateCourseLessonAssignments, getStudentCourse } from "../controllers/courseControllers.js"

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
router.get("/:id", authenticate, (req, res) => {
    switch (req?.user?.role) {
        case "student":
            return getStudentCourse(req, res);
        case "instructor":
        case "admin":
            return getCourse(req, res);
        default:
            return res.status(403).json({ message: "Unauthorized" });
    }
});
router.post("/", authenticate, authorize("instructor", "admin"), addCourse);
router.delete("/:id", authenticate, authorize("instructor", "admin"), removeCourse);
router.put("/:id", authenticate, authorize("instructor", "admin"), editCourse);
router.get("/enrolled-students/:courseCode", authenticate, authorize("instructor", "admin"), getEnrolledStudentsByCourse);
router.get("/enrolled-students", authenticate, authorize("instructor", "admin"), getEnrolledStudentsByCourse);
router.put("/:courseCode/lessons", authenticate, authorize("instructor", "admin"), updateCourseLessonAssignments);
router.get("/available", authenticate, authorize("student"), getAvailableCoursesForEnrollment);
router.post("/:courseCode/enroll", authenticate, authorize("student"), enrollCourse);
router.delete("/:courseCode/enroll", authenticate, authorize("student"), unenrollCourse);

export default router;