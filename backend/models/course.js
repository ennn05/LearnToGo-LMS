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
    const courses = await sql`SELECT * FROM "LMS".course WHERE course_code = ${courseCode};`;
    return courses[0];
}
