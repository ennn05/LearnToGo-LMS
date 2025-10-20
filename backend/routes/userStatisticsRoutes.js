import express from "express";
import { getUserStatistics } from "../controllers/userStatisticsController.js";
import { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only Admins & Instructors can access
router.get("/users", authorize("admin", "instructor"), getUserStatistics);

export default router;
