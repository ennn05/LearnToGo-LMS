import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { getInstructors, removeInstructor } from "../controllers/instructorController.js";

const router = express.Router();

// GET all instructors
router.get("/", authenticate, getInstructors);

// DELETE instructor by ID (admin only)
router.delete("/:id", authenticate, authorize("admin"), removeInstructor);

export default router;
