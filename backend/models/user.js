import sql from "../db.js";

export const getAllInstructors = async () => {
    const instructors = await sql`
        SELECT * 
        FROM "LMS".user 
        WHERE user_role = 'instructor';
    `;
    return instructors;
};
