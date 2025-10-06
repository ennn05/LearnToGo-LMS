import express from "express";
import { getInstructors, removeInstructor } from "../controllers/instructorController.js";

const router = express.Router();

// GET all instructors
router.get("/", getInstructors);

// DELETE instructor by ID
router.delete("/:id", removeInstructor);

export default router;