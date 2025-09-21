import express from "express";
import {authenticate, authorize} from "../middleware/authMiddleware.js";
import {
  getClassrooms,
  getInstructorClassrooms,
  getClassroom,
  removeClassroom,
  editClassroom,
  addClassroom
} from "../controllers/classroomController.js";

const router = express.Router();


router.get("/", getClassrooms);
router.get("/instructor", authenticate, getInstructorClassrooms);
router.get("/:classroomCode", getClassroom);
router.delete("/:id", authenticate, removeClassroom);
router.put("/:id", authenticate, editClassroom);
router.post("/", authenticate, authorize("instructor"), addClassroom);
router.put("/:id/lessons/:lessonId/students", authenticate, authorize("instructor"), editClassroom);

export default router;
