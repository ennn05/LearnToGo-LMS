import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  getTotalNumClassrooms,
  getTotalNumClassroomsByInstructor,
  getClassroomStatusBreakdown,
  getClassroomStatusBreakdownByInstructor,
  getAvgStudentsPerClassroomByInstructor,
} from "../controllers/classroomStatisticsControllers.js";

const router = express.Router();                

// Total classrooms
router.get("/total", authenticate, authorize("admin", "instructor"), (req, res) => {
  if (req.user.role === "admin") return getTotalNumClassrooms(req, res);
  if (req.user.role === "instructor") return getTotalNumClassroomsByInstructor(req, res);
  return res.status(403).json({ success: false, message: "Unauthorized" });
});

// Status breakdown
router.get("/status-breakdown", authenticate, authorize("admin", "instructor"), (req, res) => {
  if (req.user.role === "admin") return getClassroomStatusBreakdown(req, res);
  if (req.user.role === "instructor") return getClassroomStatusBreakdownByInstructor(req, res);
  return res.status(403).json({ success: false, message: "Unauthorized" });
});

// Average number of students
router.get("/average-students", authenticate, authorize("admin", "instructor"), (req, res) => {
  if (req.user.role === "instructor") return getAvgStudentsPerClassroomByInstructor(req, res);
  // If admin should also see avg — you can later add a getAvgStudentsPerClassroom() variant.
  return res.status(403).json({ success: false, message: "Unauthorized" });
});

export default router;
