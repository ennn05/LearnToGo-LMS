import sql from "../db.js";


export const countTotalNumCourses = async () => {
    const courses = await sql`SELECT COUNT(*) FROM "LMS".course;`;
    return courses;
}

export const countTotalNumCoursesByInstructor = async (instructorId) => {
    const courses = await sql`
    SELECT
    CASE 
        WHEN course_status = 'published' THEN 'Published'
        WHEN course_status = 'draft' THEN 'Draft'
        WHEN course_status = 'archived' THEN 'Archived'
        ELSE 'Null'
    END AS status,
    COUNT(*) AS course_count
    FROM "LMS".course 
    WHERE course_creator = ${instructorId}
    GROUP BY status;`;
    return courses;
}

