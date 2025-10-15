import sql from "../db.js";

export const getAllInstructors = async () => {
    const instructors = await sql`
        SELECT * 
        FROM "LMS".user 
        WHERE user_role = 'instructor';
    `;
    return instructors;
};

//TODO: Need to check for admin? or is it done in frontend
export const deleteInstructorbyAdmin = async (instructorID) => {
    const instructor = await sql `
    DELETE FROM "LMS".user 
    WHERE user_id = ${instructorID} 
    RETURNING *;
    `
}