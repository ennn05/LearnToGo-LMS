import { sql } from '../db.js';
import { checkPassword, generateJWT, hashPassword } from '../libs/auth.js';


const INSTRUCTOR_PIN = process.env.INSTRUCTOR_PIN || '12345';
const STUDENT_PIN = process.env.STUDENT_PIN || '67890';

export const register = async (req, res) => {
    const { fname, lname, pin, role, email, password } = req.body;
    try {
        if (!email || !pin || !password || !role) {
            return res.status(400).json({ status: "failed", message: "Email, PIN, password, and role are required." });
        }

        if (role === "instructor") {
            if (`${pin}` !== INSTRUCTOR_PIN) {
                return res.status(401).json({ status: "failed", message: "Invalid PIN for Instructor account." });
            }
        } else if (role === "student") {
            if (`${pin}` !== STUDENT_PIN) {
                return res.status(401).json({ status: "failed", message: "Invalid PIN for Student account." });
            }
        } else {
            return res.status(400).json({ status: "failed", message: "Invalid role." });
        }

        const existingUser = await sql`SELECT * FROM "LMS".user WHERE user_email = ${email}`;
        if (existingUser.length > 0) {
            return res.status(409).json({ status: "failed", message: "Email already in use" });
        }
        
        const hashedPassword = await hashPassword(password);
        const newUser = await sql`INSERT INTO "LMS".user (user_fname, user_lname, user_email, user_password, user_role) VALUES (${fname}, ${lname}, ${email}, ${hashedPassword}, ${role}) RETURNING *`;
        newUser[0].user_password = undefined;

        if (role === 'instructor'){
            await sql`INSERT INTO "LMS".instructor (inst_user_id) VALUES (${newUser[0].user_id}) RETURNING *`;

        }
        else if (role === 'student')
        {
            await sql`INSERT INTO "LMS".student (stu_user_id) VALUES (${newUser[0].user_id}) RETURNING *`;
        }
        
        const payload = {
            id: newUser[0].user_id,
            role: newUser[0].user_role,
        }
        const token = generateJWT(payload);

        return res.status(201).json({ success: true, message: "Registration successful", user: newUser[0] , token});

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }


};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!(email || password)) {
            return res.status(400).json({ status: "failed", message: "Provide Required Fields!" });
        }

        const user = await sql`SELECT * FROM "LMS".user WHERE user_email = ${email}`;

        if (user.length <= 0)
        {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await checkPassword(password, user[0].user_password);
        if (!isPasswordValid) 
        {
            return res.status(401).json({ message: "Invalid email or password" });    
        } 
        
        const payload = {
            id: user[0].user_id,
            role: user[0].user_role,
        }
        const token = generateJWT(payload);

        user[0].user_password = undefined;

        return res.status(200).json({ status: "success",message: "Login successful", user: user[0], token });


    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}