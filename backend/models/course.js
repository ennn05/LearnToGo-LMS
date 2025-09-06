import sql from "../db.js";

export const getAllCourses = async () => {
    const courses = await sql`SELECT * FROM "LMS".course;`;
    return courses;
}

export const getCoursesByInstructor = async (instructorId) => {
    const courses = await sql`SELECT * FROM "LMS".course WHERE course_creator = ${instructorId};`;
    return courses;
}

export const getCourseByCode = async (courseCode) => {
    const courses = await sql`SELECT * FROM "LMS".course c LEFT JOIN "LMS".instructor i ON c.course_creator = i.inst_user_id JOIN "LMS".user u
    ON i.inst_user_id = u.user_id WHERE course_code = ${courseCode};`;
    return courses[0];
}
