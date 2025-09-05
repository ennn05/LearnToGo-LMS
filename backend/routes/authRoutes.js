import express from "express";
import { sql } from "../db.js";
import { registerInstructor, registerStudent } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email, password);

  try {
    const instructor = await sql`SELECT * FROM "LMS".instructor WHERE instructor_email = ${email}`;
    console.log("DB result:", instructor);

    if (instructor.length > 0) {
      if (password === instructor[0].instructor_password) {
        return res.status(200).json({ message: "Login successful", user: instructor[0] });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


router.post("/register/instructor", registerInstructor);

router.post("/register/student", registerStudent);

export default router;