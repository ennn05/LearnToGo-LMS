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

    // code to insert course_lesson records into db later here
    
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
    const courseLessons = [];
    console.log("Removed course lesson: ", removeCourseLessons(courseCode));

    lessons.forEach(element => {
        courseLessons.push(addCourseLesson(courseCode, element.lesson_id));
    });

    return courseLessons;
}

export const getPublishedCourses = async () => {
    const courses = await sql`SELECT * 
                              FROM "LMS".course 
                              WHERE course_status = 'published';`;
    return courses;
};

export const getAllStudentsByCourseEnrolled = async () => {
    const studentsByCourse = await sql`
            SELECT 
            sc.course_code,
            COALESCE(
                json_agg(
                json_build_object(
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
            GROUP BY sc.course_code;
        `;
    return studentsByCourse;
};