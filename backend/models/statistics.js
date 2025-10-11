import sql from "../db.js";


export const countTotalNumCourses = async () => {
    const courses = await sql`SELECT COUNT(*) FROM "LMS".course;`;
    return courses[0];
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

export const avgNumLessonsPerCourse = async () => {
    const avg = 0; // dummy values for now

    return avg;
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

export const numCourseBreakdownByStatus = async () => {
    // dummy values for now
    const breakdown = [ {course_status: 'draft', count: 0}, 
                        {course_status: 'published', count: 0}, 
                        {course_status: 'archived', count: 0} 
                    ]; 
    return breakdown;                    
}

export const numCourseBreakdownByStatusForInstructor = async (instructorId) => {
    // dummy values for now
    const breakdown = [ {course_status: 'draft', count: 0}, 
                        {course_status: 'published', count: 0}, 
                        {course_status: 'archived', count: 0} 
                    ]; 

    return breakdown;                    
}

//total number of lessons in lesson table
export const countTotalNumLessons = async () => {
  const total = await sql `SELECT COUNT(*) FROM "LMS".lesson`
  return total
}

//number of lessons published, archived (overall)
export const countLessonsByStatus = async () => {
  const total = await sql 
    `SELECT
    CASE 
        WHEN lesson_status = 'published' THEN 'Published'
        WHEN lesson_status = 'draft' THEN 'Draft'
        WHEN lesson_status = 'archived' THEN 'Archived'
        ELSE 'Null'
    END AS status,
    COUNT(*) AS lesson_count
    FROM "LMS".lesson 
    GROUP BY status;`;
  return total
}


//avg credit points per lesson (overall)
export const avgCreditPointsPerLesson = async () => {
  const total = await sql 
    `select round(avg(lesson_credit), 2) from "LMS".lesson`;
  return total
}

//total num of classrooms created
export const totalNumOfClassrooms = async () => {
  const total = await sql 
    `select count(*) from "LMS".classroom`;
  return total
}
export const totalNumOfClassroomsByInstructor = async (instructorId) => {
  const total = await sql 
    `select count(*) from "LMS".classroom where cr_creator = ${instructorId}`;
  return total
}
//num of classrooms completed by instructor
//note: dateadd is to get the end date
export const numClassroomsCompletedByInstructor = async (instructorId) => {
  const total = await sql 
    `SELECT COUNT(*) AS completed_classrooms
    FROM "LMS".classroom
    WHERE cr_creator = ${instructorId}
    AND CURRENT_DATE > cr_start_date + (cr_duration * INTERVAL '1 week')`;
;
  return total
}

//num of cr ongoing
export const numClassroomOngoingByInstructor = async (instructorId) => {
  const total = await sql 
    `SELECT COUNT(*)
    FROM "LMS".classroom
    WHERE cr_creator = ${instructorId}
    AND CURRENT_DATE <= cr_start_date + (cr_duration * INTERVAL '1 week')`;
;
  return total
}


//num of cr not started


//avg num of stu per classroom