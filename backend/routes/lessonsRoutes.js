import express from "express";
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  getLessons,
  getLesson,
  getLessonsByInstructor,
  addLesson,
  editLesson,
  removeLesson,
  getPublished,
  getStudentLessons,
  getStudentLesson
} from "../controllers/lessonControllers.js";

const router = express.Router();
router.get("/published", getPublished);
router.get("/", authenticate, (req, res) => {
    switch (req?.user?.role) {
        case "student":
            return getStudentLessons(req, res);
        case "instructor":
        case "admin":
            return getLessons(req, res);
        default:
            return res.status(403).json({ message: "Unauthorized" });
    }
});

router.get("/instructor", authenticate, getLessonsByInstructor);

router.get("/:id", authenticate, (req, res) => {
    switch (req?.user?.role) {
        case "student":
            return getStudentLesson(req, res);
        case "instructor":
        case "admin":
            return getLesson(req, res);
        default:
            return res.status(403).json({ message: "Unauthorized" });
    }
});

router.post("/", authenticate, authorize("instructor", "admin"), addLesson);
router.put("/:id", authenticate, authorize("instructor", "admin"), editLesson);
router.delete("/:id", authenticate, authorize("instructor", "admin"), removeLesson);

export default router;
