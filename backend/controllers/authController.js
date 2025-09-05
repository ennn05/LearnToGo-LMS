const INSTRUCTOR_PIN = process.env.INSTRUCTOR_PIN || "12345";
const STUDENT_PIN = process.env.STUDENT_PIN || "67890";

export const registerInstructor = async (req, res) => {
    const { email, pin, password } = req.body;
    console.log("Registration attempt:", email, pin, password);

    try {
        if (!email || !pin || !password) {
            return res.status(400).json({ status: "failed", message: "Email, PIN, and password are required." });
        }

        if (pin !== INSTRUCTOR_PIN) {
            return res.status(404).json({ status: "failed", message: "Invalid PIN for Instructor account." });
        }

        const existingInstructor = await sql`SELECT * FROM "LMS".instructor WHERE instructor_email = ${email}`;
        if (existingInstructor.rows.length > 0) {
            return res.status(409).json({ status: "failed", message: "Email already in use" });
        }

        const newInstructor = await sql`INSERT INTO "LMS".instructor (instructor_email, instructor_password) VALUES (${email}, ${password}) RETURNING *`;
        newInstructor.rows[0].instructor_password = undefined;
        
        console.log("DB result:", newInstructor);
        return res.status(201).json({ success: true, message: "Registration successful", user: newInstructor[0] });
        
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const registerStudent = async (req, res) => {
    const { email, pin, password } = req.body;
    console.log("Registration attempt:", email, pin, password);

    try {
        if (!email || !pin || !password) {
            return res.status(400).json({ status: "failed", message: "Email, PIN, and password are required." });
        }

        if (pin !== STUDENT_PIN) {
            return res.status(404).json({ status: "failed", message: "Invalid PIN for Student account." });
        }

        const existingStudent = await sql`SELECT * FROM "LMS".student WHERE student_email = ${email}`;
        if (existingStudent.rows.length > 0) {
            return res.status(409).json({ status: "failed", message: "Email already in use" });
        }

        const newStudent = await sql`INSERT INTO "LMS".student (student_email, student_password) VALUES (${email}, ${password}) RETURNING *`;
        newStudent.rows[0].student_password = undefined;

        console.log("DB result:", newStudent);
        return res.status(201).json({ success: true, message: "Registration successful", user: newStudent[0] });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};