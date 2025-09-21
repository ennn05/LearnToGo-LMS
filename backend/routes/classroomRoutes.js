import express from "express";
import {authenticate, authorize} from "../middleware/authMiddleware.js";
import {
  getClassrooms,
  getInstructorClassrooms,
  getClassroom,
  removeClassroom,
  editClassroom,
  addClassroom,
  updateStudentMarksForClassroomLesson,
} from "../controllers/classroomController.js";

const router = express.Router();


router.get("/", getClassrooms);
router.get("/instructor", authenticate, getInstructorClassrooms);
router.get("/:classroomCode", getClassroom);
router.delete("/:id", authenticate, removeClassroom);
router.put("/:id", authenticate, editClassroom);
router.post("/", authenticate, authorize("instructor"), addClassroom);
router.put("/:cr_id/lessons/:crcl_cl_id/students", authenticate, authorize("instructor"), updateStudentMarksForClassroomLesson);

export default router;
