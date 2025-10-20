import sql from "../db.js";

export const getAllCourses = async () => {
    const courses = await sql`SELECT * FROM "LMS".course c
                            LEFT JOIN "LMS".instructor i ON c.course_creator = i.inst_user_id
                            LEFT JOIN "LMS".user u ON u.user_id = i.inst_user_id;`;
    return courses;
}

export const getCoursesByInstructor = async (instructorId) => {
    const courses = await sql`SELECT * FROM "LMS".course WHERE course_creator = ${instructorId};`;
    return courses;
}

//Fetch only courses that the student is enrolled in
export const getEnrolledCoursesByStudent = async (studentId) => {
    const courses = await sql `
    SELECT 
        c.course_code,
        c.course_title,
        c.course_status,
        c.course_total_credit,
        u.user_fname AS instructor_fname,
        u.user_lname AS instructor_lname
    FROM "LMS".student_course sc
    JOIN "LMS".course c ON sc.course_code = c.course_code
    JOIN "LMS".instructor i ON c.course_creator = i.inst_user_id
    JOIN "LMS".user u ON i.inst_user_id = u.user_id
    WHERE sc.stu_user_id = ${studentId};
    `
    return courses;
}

// Fetch only courses that are published and not yet enrolled by the student
export const getAvailableCoursesForStudent = async (studentId) => {
    const courses = await sql `SELECT 
            c.course_code,
            c.course_title,
            c.course_status,
            c.course_total_credit,
            u.user_fname AS instructor_fname,
            u.user_lname AS instructor_lname
        FROM "LMS".course c
        JOIN "LMS".instructor i ON c.course_creator = i.inst_user_id
        JOIN "LMS".user u ON i.inst_user_id = u.user_id
        WHERE c.course_status = 'published'
        AND NOT EXISTS (
            SELECT 1
            FROM "LMS".student_course sc
            WHERE sc.stu_user_id = ${studentId}
            AND sc.course_code = c.course_code
  );`
    return courses;
}

// Add a record new enrollment to student_course table
export const addCourseEnrollment = async (studentId, courseCode) => {
    const course = await sql`INSERT INTO "LMS".student_course (stu_user_id, course_code)
    VALUES (${studentId}, ${courseCode}) RETURNING *;`;

    // const course = [{student_id: studentId, course_code: courseCode}]; // temporary placeholder
    return course[0];
}   

export const addStudentLessonsForCourse = async (studentId, courseCode) => {
    const lessons = await sql`INSERT INTO "LMS".grade (stu_user_id, lesson_id)
        SELECT ${studentId}, cl.cl_lesson_id
        FROM "LMS".course_lesson cl
        WHERE cl.cl_course_code = ${courseCode}
        ON CONFLICT (stu_user_id, lesson_id) DO NOTHING;
        `;

    return lessons;
}   

export const getCourseByCode = async (courseCode) => {
    const courses = await sql`SELECT c.*, u.user_id, u.user_fname, u.user_lname, 
                            COALESCE(json_agg(
                                json_build_object(
                                    'lesson_id', l.lesson_id,
                                    'lesson_title', l.lesson_title,
                                    'lesson_credit', l.lesson_credit
                                )
                            ) FILTER (WHERE l.lesson_id IS NOT NULL),
                                '[]' ::json)
                            AS lessons
                                FROM "LMS".course c 
                                LEFT JOIN "LMS".instructor i 
                                    ON c.course_creator = i.inst_user_id 
                                LEFT JOIN "LMS".user u
                                    ON i.inst_user_id = u.user_id 
                                LEFT JOIN "LMS".course_lesson cl
                                    ON c.course_code = cl.cl_course_code
                                LEFT JOIN "LMS".lesson l
                                    ON cl.cl_lesson_id = l.lesson_id
                            WHERE c.course_code = ${courseCode}
                            GROUP BY c.course_code, u.user_id;`;
    
    return courses[0];
}

export const createCourse = async (courseData) => {
    const course = await sql`INSERT INTO "LMS".course 
    (course_code, course_title, course_total_credit, course_date_created, course_date_updated, course_creator, course_status)
    VALUES
    (${courseData.code}, ${courseData.title}, ${courseData.total_credit}, ${courseData.date_created}, ${courseData.date_updated}, ${courseData.creator}, ${courseData.status}) RETURNING *;`;
    
    return course[0];
}

export const deleteCourse = async (courseCode) => {
    const courses = await sql`DELETE FROM "LMS".course WHERE course_code = ${courseCode} RETURNING *;`;
    return courses[0];
}

export const updateCourse = async (courseData) => {
    const {id, updateData} = courseData;
    console.log(courseData);
    const courses = await sql`UPDATE "LMS".course 
                    SET 
                        course_code = ${updateData.course_code},
                        course_title = ${updateData.course_title},
                        course_total_credit = ${updateData.course_total_credit},
                        course_date_updated = ${updateData.course_date_updated},
                        course_status = ${updateData.course_status}
                    WHERE course_code = ${id} 
                    RETURNING *;`;
    return courses[0];
}

export const addCourseLesson = async (courseCode, lessonId) => {
    const courseLesson = await sql`INSERT INTO "LMS".course_lesson 
    (cl_course_code, cl_lesson_id)
    VALUES
    (${courseCode}, ${lessonId}) RETURNING *;`;

    console.log("Added course lesson:", courseLesson[0]);
    return courseLesson[0];
}

export const removeCourseLessons = async (courseCode) => {
    const courseLesson = await sql`DELETE FROM "LMS".course_lesson 
    WHERE cl_course_code = ${courseCode} RETURNING *;`;

    return courseLesson[0];
}

export const updateCourseLessons = async (courseCode, lessons) => {
    await removeCourseLessons(courseCode);

    const courseLessons = [];
    for (const element of lessons) {
        const addedLesson = await addCourseLesson(courseCode, element.lesson_id);
        courseLessons.push(addedLesson);
    }

    return courseLessons;
};

export const getPublishedCourses = async () => {
    const courses = await sql`SELECT * 
                              FROM "LMS".course 
                              WHERE course_status = 'published';`;
    return courses;
};

export const getAllStudentsByCourseEnrolled = async (courseCode=undefined) => {
    const studentsByCourse = await sql`
            SELECT 
            sc.course_code,
            COALESCE(
                json_agg(
                json_build_object(
                    'stucourse_id', sc.stucourse_id,
                    'stu_user_id', s.stu_user_id,
                    'user_fname', u.user_fname,
                    'user_lname', u.user_lname,
                    'user_email', u.user_email
                )
                ) FILTER (WHERE s.stu_user_id IS NOT NULL),
                '[]'::json
            ) AS students
            FROM "LMS".student_course sc
            LEFT JOIN "LMS".student s ON sc.stu_user_id = s.stu_user_id
            LEFT JOIN "LMS".user u ON s.stu_user_id = u.user_id
            ${courseCode ? sql`WHERE sc.course_code = ${courseCode}` : sql``}
            GROUP BY sc.course_code;
        `;
    return studentsByCourse;
};