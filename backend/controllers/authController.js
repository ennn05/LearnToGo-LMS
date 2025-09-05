const INSTRUCTOR_PIN = process.env.INSTRUCTOR_PIN || "12345";

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
        console.log("DB result:", newInstructor);
        return res.status(201).json({ success: true, message: "Registration successful", user: newInstructor[0] });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
