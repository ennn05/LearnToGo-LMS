import sql from "../db.js";

export const getAllInstructors = async () => {
    const instructors = await sql`
        SELECT u.user_id,
               u.user_fname,
               u.user_lname,
               u.user_email,
               u.user_role
        FROM "LMS".instructor i
        JOIN "LMS".user u ON i.inst_user_id = u.user_id
        WHERE user_role = 'instructor';
    `;
    console.log(instructors);
    return instructors;
};

export const deleteInstructor = async (instUserId) => {
    const deletedInstructor = await sql`
        DELETE FROM "LMS".user 
        WHERE user_id = ${instUserId} 
        RETURNING *;
    `;
    console.log(deletedInstructor);
    return deletedInstructor;
};
