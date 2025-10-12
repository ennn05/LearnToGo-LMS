import express from "express";
import {authenticate, authorize} from "../middleware/authMiddleware.js";
import { getAvgLessonsPerCourse, getAvgLessonsPerCourseOfInstructor, getNumCoursesBreakdownByStatus, getNumCoursesBreakdownByStatusForInstructor, getNumLessonsBreakdownByStatus, getNumLessonsBreakdownByStatusForInstructor, getTotalNumCourses, getTotalNumCoursesOfInstructor, getTotalNumLessons, getTotalNumLessonsOfInstructor } from "../controllers/statisticsControllers.js";

const router = express.Router();

router.get("/courses/total", authenticate, authorize("admin", "instructor"), (req, res) => {
            switch (req?.user?.role) {
                case "instructor":
                    return getTotalNumCoursesOfInstructor(req, res);
                case "admin":
                    return getTotalNumCourses(req, res);
                default:
                    return res.status(403).json({ message: "Unauthorized" });
            }
        });

router.get("/courses/average-lessons", authenticate, authorize("admin", "instructor"), (req, res) => {
            switch (req?.user?.role) {
                case "instructor":
                    return getAvgLessonsPerCourseOfInstructor(req, res);
                case "admin":
                    return getAvgLessonsPerCourse(req, res);
                default:
                    return res.status(403).json({ message: "Unauthorized" });
            }
        });

router.get("/courses/status-breakdown", authenticate, authorize("admin", "instructor"), (req, res) => {
            switch (req?.user?.role) {
                case "instructor":
                    return getNumCoursesBreakdownByStatusForInstructor(req, res);
                case "admin":
                    return getNumCoursesBreakdownByStatus(req, res);
                default:
                    return res.status(403).json({ message: "Unauthorized" });
            }
        });

router.get("/lessons/total", authenticate, authorize("admin", "instructor"), (req, res) => {
            switch (req?.user?.role) {
                case "instructor":
                    return getTotalNumLessonsOfInstructor(req, res);
                case "admin":
                    return getTotalNumLessons(req, res);
                default:
                    return res.status(403).json({ message: "Unauthorized" });
            }
        });

router.get("/lessons/status-breakdown", authenticate, authorize("admin", "instructor"), (req, res) => {
            switch (req?.user?.role) {
                case "instructor":
                    return getNumLessonsBreakdownByStatusForInstructor(req, res);
                case "admin":
                    return getNumLessonsBreakdownByStatus(req, res);
                default:
                    return res.status(403).json({ message: "Unauthorized" });
            }
        });

export default router;