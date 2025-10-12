import sql from "../db.js";

//instructor stats
export const countTotalNumCoursesByInstructor = async (instructorId) => {
    const courses = await sql`SELECT COUNT(*) FROM "LMS".course WHERE cr_course_creator = ${instructorId};`;
    return courses[0];
}

export const numCourseBreakdownByStatusForInstructor = async (instructorId) => {
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

export const avgNumLessonsPerCourseByInstructor = async(instructorId) => {
    const result = await sql`
    SELECT 
        ROUND(AVG(lesson_count), 2) AS avg_lessons_per_course
    FROM (
        SELECT 
        c.course_code,
        COUNT(l.lesson_id) AS lesson_count
        FROM "LMS".course_lesson cl
        JOIN "LMS".course c 
        ON cl.cl_course_code = c.course_code
        JOIN "LMS".lesson l 
        ON cl.cl_lesson_id = l.lesson_id
        WHERE c.course_creator = ${instructorId}
        GROUP BY c.course_code
    ) AS per_course;
    `;
    return result[0];
}

//admin stats
export const countTotalNumCourses = async () => {
    const courses = await sql`SELECT COUNT(*) FROM "LMS".course;`;
    return courses[0];
}

export const numCourseBreakdownByStatus = async () => {
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
    GROUP BY status;`;
    return courses;
}

export const avgNumLessonsPerCourse = async() => {
    const result = await sql`
    SELECT 
        ROUND(AVG(lesson_count), 2) AS avg_lessons_per_course
    FROM (
        SELECT 
        c.course_code,
        COUNT(l.lesson_id) AS lesson_count
        FROM "LMS".course_lesson cl
        JOIN "LMS".course c 
        ON cl.cl_course_code = c.course_code
        JOIN "LMS".lesson l 
        ON cl.cl_lesson_id = l.lesson_id
        GROUP BY c.course_code
    ) AS per_course;
    `;
    return result[0];
}