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

//us43 : lesson stats (instructor view)

export const countTotalNumLessonsByInstructor = async (instructorId) => {
  const total = await sql `SELECT COUNT(*) FROM "LMS".lesson WHERE lesson_designer = ${instructorId}`
  return total
}

export const countLessonsByStatusByInstructor = async (instructorId) => {
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
    WHERE lesson_designer = ${instructorId}
    GROUP BY status;`;
  return total
}

//avg credit points per lesson 
export const avgCreditPointsPerLessonByInstructor = async (instructorId) => {
  const total = await sql 
    `select round(avg(lesson_credit), 2) from "LMS".lesson where lesson_designer = ${instructorId}`;
  return total
}

//us43 : lesson stats (admin view)
export const countTotalNumLessons = async () => {
  const total = await sql `SELECT COUNT(*) FROM "LMS".lesson`
  return total
}


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

//avg credit points per lesson 
export const avgCreditPointsPerLesson = async () => {
  const total = await sql 
    `select round(avg(lesson_credit), 2) from "LMS".lesson`;
  return total
}

//us44 : classroom stats (instructor view)
export const totalNumOfClassroomsByInstructor = async (instructorId) => {
  const total = await sql 
    `select count(*) from "LMS".classroom where cr_creator = ${instructorId}`;
  return total
}

//num of classrooms completed by instructor
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
export const numClassroomNotStartedByInstructor = async (instructorId) => {
  const total = await sql 
    `SELECT COUNT(*)
    FROM "LMS".classroom
    WHERE cr_creator = ${instructorId}
    AND CURRENT_DATE < cr_start_date`;
;
  return total
}

//avg num of stu per classroom
export const avgNumOfStuPerClassroomByInstructor = async (instructorId) => {
  const total = await sql 
    `SELECT 
        AVG(student_count) AS avg_students_per_classroom
    FROM (
        SELECT 
            cs.cr_id,
            COUNT(sc.stu_user_id) AS student_count
        FROM "LMS".classroom_student cs join "LMS".student_course sc on cs.stucourse_id = sc.stucourse_id
        GROUP BY cs.cr_id
    ) AS classroom_counts;`;
  return total
}

//us44 : admin view of classroom stats
//total num of classrooms created
export const totalNumOfClassrooms = async () => {
  const total = await sql 
    `select count(*) from "LMS".classroom`;
  return total
}




//total num of students not enrolled (not enrolled into course or cr?)

//total num of students that are in an ongoing (ongoing what?)

//total num of students who completed everything(?)