import express from "express";
import { getUserStatistics } from "../controllers/userStatisticsController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/statistics/users
// router.get(
//   "/users",
//   verifyToken,
//   authorizeRoles("admin", "instructor"), // block students
//   getUserStatistics
// );

router.get("/users", authenticate, authorize("admin", "instructor"),
  (req, res) => { 
    console.log("HITTTT")
    return getUserStatistics(req, res);
  }
);

export default router;