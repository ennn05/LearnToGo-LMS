import sql from "../db.js";

export const getAllInstructors = async () => {
    const instructors = await sql`
        SELECT u.user_id,
               u.user_fname,
               u.user_lname,
               u.user_email,
               u.user_role,
               i.inst_department,
               i.inst_specialization
        FROM "LMS".instructor i
        JOIN "LMS".user u ON i.inst_user_id = u.user_id;
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
