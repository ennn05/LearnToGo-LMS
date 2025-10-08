import express from "express";
import {authenticate, authorize} from "../middleware/authMiddleware";
import { getTotalNumCourses, getTotalNumCoursesOfInstructor } from "../controllers/statisticsControllers";

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
                    // return 
                case "admin":
                    return getAvgLessonsPerCourse(req, res);
                default:
                    return res.status(403).json({ message: "Unauthorized" });
            }
        });

export default router;