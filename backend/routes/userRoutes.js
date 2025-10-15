import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { getInstructors, removeInstructor } from "../controllers/userControllers.js";

const router = express.Router();

router.get("/instructors", authenticate, authorize("admin"), getInstructors);
router.delete("/instructors/:id", authenticate, authorize("admin"), removeInstructor);

// Admin-only instructor management
router.get("/admin/instructors", authenticate, authorize("admin"), getInstructorsByAdmin);

export default router;
