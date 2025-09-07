import sql from "../db.js";

export const getAllStudents = async () => {
    const students = await sql`SELECT u.user_id,
        u.user_fname,
        u.user_lname,
        u.user_email,
        u.user_role,
        s.stu_dob,
        s.stu_grade
    FROM "LMS".student s
    JOIN "LMS".user u ON s.stu_user_id = u.user_id;`;
    console.log(students);
    return students;
}


export const deleteStudent = async (stuUserId) => {
    const deletedStudent = await sql`DELETE FROM "LMS".user WHERE user_id = ${stuUserId} RETURNING *;`;
    console.log(deletedStudent);
    return deletedStudent;
}