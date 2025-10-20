import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { getInstructors, getInstructorsByAdmin } from "../controllers/userControllers.js";

const router = express.Router();

// General list (for all roles)
router.get("/instructors", authenticate, getInstructors);

// Admin-only instructor management
router.get("/admin/instructors", authenticate, authorize("admin"), getInstructorsByAdmin);

export default router;