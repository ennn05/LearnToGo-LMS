import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getCourses, getCourse, getInstructorCourses, addCourse, removeCourse, editCourse, getStudentCourses, getAvailableCoursesForEnrollment } from "../controllers/courseControllers.js"

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

router.get("/instructor", authenticate, getInstructorCourses);
// router.get("/instructor/:id", getInstructorCourses);
router.get("/instructor/:id", getCourse);
router.post("/", addCourse);
router.delete("/:id", removeCourse);
router.put("/:id", editCourse);

export default router;