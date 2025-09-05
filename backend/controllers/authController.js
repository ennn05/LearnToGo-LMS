import { sql } from '../db.js';
import { hashPassword } from '../libs/auth.js';


const INSTRUCTOR_PIN = process.env.INSTRUCTOR_PIN || "12345";
const STUDENT_PIN = process.env.STUDENT_PIN || "67890";

export const register = async (req, res) => {
    const { email, pin, password, role } = req.body;
    console.log("Registration attempt:", email, pin, password, role);

    try {
        if (!email || !pin || !password || !role) {
            return res.status(400).json({ status: "failed", message: "Email, PIN, password, and role are required." });
        }

        if (role === "instructor") {
            if (pin !== INSTRUCTOR_PIN) {
                return res.status(404).json({ status: "failed", message: "Invalid PIN for Instructor account." });
            }
        } else if (role === "student") {
            if (pin !== STUDENT_PIN) {
                return res.status(404).json({ status: "failed", message: "Invalid PIN for Student account." });
            }
        } else {
            return res.status(400).json({ status: "failed", message: "Invalid role." });
        }

        const existingUser = await sql`SELECT * FROM "LMS".${role} WHERE ${role}_email = ${email}`;
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ status: "failed", message: "Email already in use" });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await sql`INSERT INTO "LMS".${role} (${role}_email, ${role}_password) VALUES (${email}, ${hashedPassword}) RETURNING *`;
        newUser.rows[0][`${role}_password`] = undefined;

        console.log("DB result:", newUser);
        return res.status(201).json({ success: true, message: "Registration successful", user: newUser[0] });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const login = async (req, res) => {

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


    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}