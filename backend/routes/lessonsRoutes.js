import express from "express";
import { sql } from "../db.js";

const router = express.Router();

// Get all lessons
router.get("/", async (req, res) => {
  try {
    const lessons = await sql`SELECT * FROM "LMS".lesson ORDER BY lesson_id ASC;`;
    res.json(lessons);
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ message: "Internal server error: fail to get lessons" });
  }
});

// Add Lesson
router.post("/", async (req, res) => {
  try {
    const { title, description, objective, estimatedTime } = req.body;

    const today = new Date().toISOString().split('T')[0];
    console.log(today);

    const newLesson = await sql`
    INSERT INTO "LMS".lesson 
        (lesson_title, lesson_desc, lesson_obj, lesson_effort_per_week, lesson_date_created, lesson_date_updated)
    VALUES (${title}, ${description}, ${objective}, ${estimatedTime}, ${today}, ${today})
    RETURNING *;
    `;

    res.status(201).json(newLesson[0]);
  } catch (err) {
    console.error("Error inserting lesson:", err);
    res.status(500).json({ message: "Internal server error: fail to add lesson" });
  }
});

export default router;
