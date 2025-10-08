import sql from "../db.js";


export const countTotalNumCourses = async () => {
    const courses = await sql`SELECT COUNT(*) FROM "LMS".course;`;
    return courses;
}

export const countTotalNumCoursesByInstructor = async (instructorId) => {
    const courses = await sql`SELECT COUNT(*) FROM "LMS".course WHERE course_creator = ${instructorId};`;
    return courses;
}

