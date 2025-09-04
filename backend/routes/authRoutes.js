import express from "express";
import pool from "../db.js"; 
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const instructor = await pool.query("SELECT * FROM instructors WHERE instructor_email = $1", [email]);

    if (instructor.rows.length > 0) {
      const isMatch = await bcrypt.compare(password, instructor.rows[0].instructor_password);
      if (isMatch) {
        return res.status(200).json({ message: "Login successful" });
      }
    }
    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// router.post("/register", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = await pool.query(
//       "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
//       [email, hashedPassword]
//     );
//     return res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
//   } catch (error) {
//     console.error("Error registering user:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });

export default router;