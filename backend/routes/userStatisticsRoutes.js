import express from "express";
import { getUserStatistics } from "../controllers/userStatisticsController.js";
// import { verifyToken, authorizeRoles } from "../middleware/auth.js"; 
// // assuming you have middleware for JWT + role checking
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/statistics/users
// router.get(
//   "/users",
//   verifyToken,
//   authorizeRoles("admin", "instructor"), // block students
//   getUserStatistics
// );

router.get(
  "/users",
  authenticate,
  authorize("admin", "instructor"),
  getUserStatistics
);

export default router;