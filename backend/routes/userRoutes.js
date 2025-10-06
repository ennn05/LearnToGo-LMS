import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { getInstructors, removeInstructor } from "../controllers/userControllers.js";

const router = express.Router();

router.get("/instructors", authenticate, authorize("admin"), getInstructors);
router.delete("/instructors/:id", authenticate, authorize("admin"), removeInstructor);

export default router;
