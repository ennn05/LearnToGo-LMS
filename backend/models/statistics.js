import sql from "../db.js";


export const countTotalNumCourses = async () => {
    const courses = await sql`SELECT COUNT(*) FROM "LMS".course;`;
    return courses;
}



