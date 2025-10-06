import express from "express";
import { getInstructors, removeInstructor } from "../controllers/instructorController.js";

const router = express.Router();

router.get("/", getInstructors);
router.delete("/:id", removeInstructor);

export default router;