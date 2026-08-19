import sql from "../db.js";

export const getAllInstructors = async () => {
    const instructors = await sql`
        SELECT * 
        FROM "LMS".user 
        WHERE user_role = 'instructor';
    `;
    return instructors;
};

export const getAllInstructorsByAdmin = async () => {
    const instructors = await sql`
        SELECT 
        user_id,
        user_fname,
        user_lname,
        user_email
        FROM "LMS".user 
        WHERE user_role = 'instructor';
    `;
    return instructors;
};