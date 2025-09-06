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

export const createCourse = async (courseData) => {
    const course = await sql`INSERT INTO "LMS".course 
    (course_code, course_title, course_total_credit, course_date_created, course_date_updated, course_creator, course_status)
    VALUES
    (${courseData.code}, ${courseData.title}, ${courseData.total_credit}, ${courseData.date_created}, ${courseData.date_updated}, ${courseData.creator}, ${courseData.status}) RETURNING *;`;

    // code to insert course_lesson records into db later here
    
    return course[0];
}



