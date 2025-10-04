import sql from "../db.js";

export const getAllInstructors = async () => {
    const instructors = await sql`
        SELECT * 
        FROM "LMS".user 
        WHERE user_role = 'instructor';
    `;
    return instructors;
};

export const getAllInstructorsbyAdmin = async () => {
    const instructors = await sql`
        SELECT 
        user_fname,
        user_lname,
        user_email
        FROM "LMS".user 
        WHERE user_role = 'instructor';
    `;
    return instructors;
};