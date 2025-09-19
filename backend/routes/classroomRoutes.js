import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  getClassrooms,
  getInstructorClassrooms,
  getClassroom,
  removeClassroom,
  editClassroom
} from "../controllers/classroomController.js";

const router = express.Router();


router.get("/", getClassrooms);
router.get("/instructor", authenticate, getInstructorClassrooms);
router.get("/:classroomCode", getClassroom);
router.delete("/:id", authenticate, removeClassroom);
router.put("/:id", authenticate, editClassroom);

export default router;
