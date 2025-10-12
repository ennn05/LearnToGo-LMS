import sql from "../db.js";

//Get all the classrooms in the system
export const getAllClassrooms = async () => {
    const classrooms = await sql`SELECT cr.*, c.*,
                                usv.user_fname AS supervisor_fname,
                                usv.user_lname AS supervisor_lname,
                                uc.user_fname AS creator_fname,
                                uc.user_lname AS creator_lname
                                FROM "LMS".classroom cr
                                LEFT JOIN "LMS".course c ON cr.course_code = c.course_code
                                LEFT JOIN "LMS".instructor isv ON cr.supervisor_id = isv.inst_user_id
                                LEFT JOIN "LMS".user usv ON isv.inst_user_id = usv.user_id
                                LEFT JOIN "LMS".instructor ic ON cr.cr_creator = ic.inst_user_id
                                LEFT JOIN "LMS".user uc ON ic.inst_user_id = uc.user_id;`;
    return classrooms;
}

//Get classrooms assigned to a specfic instructor
export const getClassroomsByInstructor = async (instructorId) => {
  const classrooms = await sql`
    SELECT 
      cr.cr_id,
      cr.cr_status,
      cr.cr_start_date,
      cr.cr_duration,
      c.course_name,
      usv.user_fname ||' '|| usv.user_lname AS supervisor_name
    FROM "LMS".classroom cr
    LEFT JOIN "LMS".course c 
      ON cr.course_code = c.course_code
    LEFT JOIN "LMS".instructor isv 
      ON cr.supervisor_id = isv.inst_user_id
    LEFT JOIN "LMS".user usv 
      ON isv.inst_user_id = usv.user_id
    WHERE cr.supervisor_id = ${instructorId}
    ORDER BY cr.cr_start_date DESC;
  `;
  return classrooms;
};


// Fetch a classroom with its course, creator, supervisor, and all associated lessons in one JSON response
export const getClassroomByCode = async (classroomCode) => {
    const classroom = await sql`
                            SELECT 
                                cr.*,
                                c.*,
                                uc.user_fname AS creator_fname,
                                uc.user_lname AS creator_lname,
                                usv.user_fname AS supervisor_fname,
                                usv.user_lname AS supervisor_lname,

                                -- Aggregate lessons separately
                                (
                                    SELECT COALESCE(
                                        json_agg(
                                            jsonb_build_object(
                                                'cl_id', cl.cl_id,
                                                'lesson_id', l.lesson_id,
                                                'lesson_title', l.lesson_title,
                                                'lesson_credit', l.lesson_credit,
                                                'lesson_designer', l.lesson_designer
                                            )                                        
                                        ) FILTER (WHERE l.lesson_id IS NOT NULL)
                                        , '[]'::json 
                                    )
                                    FROM "LMS".classroom_course_lesson crcl
                                    LEFT JOIN "LMS".course_lesson cl 
                                        ON crcl.crcl_cl_id = cl.cl_id
                                    LEFT JOIN "LMS".lesson l 
                                        ON cl.cl_lesson_id = l.lesson_id
                                    WHERE crcl.crcl_cr_id = cr.cr_id
                                ) AS lessons,

                                -- Aggregate students separately
                                (
                                    SELECT COALESCE(
                                        json_agg(
                                            jsonb_build_object(
                                                'stucourse_id', stuc.stucourse_id,
                                                'stu_user_id', s.stu_user_id,
                                                'stu_user_fname', su.user_fname,
                                                'stu_user_lname', su.user_lname,
                                                'stu_user_email', su.user_email
                                            )
                                        ) FILTER (WHERE s.stu_user_id IS NOT NULL)
                                        , '[]'::json
                                    )
                                    FROM "LMS".classroom_student cs
                                    LEFT JOIN "LMS".student_course stuc 
                                        ON cs.stucourse_id = stuc.stucourse_id
                                    LEFT JOIN "LMS".student s 
                                        ON stuc.stu_user_id = s.stu_user_id
                                    LEFT JOIN "LMS".user su 
                                        ON s.stu_user_id = su.user_id
                                    WHERE cs.cr_id = cr.cr_id
                                ) AS students

                            FROM "LMS".classroom cr
                            LEFT JOIN "LMS".course c 
                                ON cr.course_code = c.course_code
                            LEFT JOIN "LMS".instructor ic 
                                ON cr.cr_creator = ic.inst_user_id
                            LEFT JOIN "LMS".user uc 
                                ON ic.inst_user_id = uc.user_id
                            LEFT JOIN "LMS".instructor isv 
                                ON cr.supervisor_id = isv.inst_user_id
                            LEFT JOIN "LMS".user usv 
                                ON isv.inst_user_id = usv.user_id

                            WHERE cr.cr_id = ${classroomCode};
                        `;
    return classroom[0];
}

export const updateClassroom = async (id, updateData) => {
    console.log(id, updateData);
    const classrooms = await sql`UPDATE "LMS".classroom 
                    SET 
                        cr_start_date = ${updateData.cr_start_date},
                        cr_duration = ${updateData.cr_duration},
                        cr_last_updated = ${updateData.cr_last_updated},
                        supervisor_id = ${updateData.supervisor_id},
                        course_code = ${updateData.course_code},
                        cr_status = ${updateData.cr_status}
                    WHERE cr_id = ${id} 
                    RETURNING *;`;
    return classrooms[0];
}

export const updateClassroomLessons = async (classroomCode, lessons) => {
    await removeClassroomLessons(classroomCode)

    const classroomLessons = [];
    for (const lesson of lessons)
    {
        const addedLesson = await addClassroomLesson(classroomCode, lesson.cl_id);
        classroomLessons.push(addedLesson);
    }

    return classroomLessons;
}

export const createClassroom = async (classroomData) => {
    const classroom = await sql`
        INSERT INTO "LMS".classroom
            (cr_id, cr_start_date, cr_duration, cr_date_created, cr_last_updated,
             cr_creator, supervisor_id, course_code, cr_status)
        VALUES
            (${classroomData.cr_id}, ${classroomData.cr_start_date}, ${classroomData.cr_duration},
             ${classroomData.cr_date_created}, ${classroomData.cr_date_updated},
             ${classroomData.cr_creator}, ${classroomData.supervisor_id}, ${classroomData.course_code}, ${classroomData.cr_status})
        RETURNING *;
    `;

    return classroom[0];
};

export const deleteClassroom = async (cr_id) => {
  const result = await sql`
    DELETE FROM "LMS".classroom
    WHERE cr_id = ${cr_id}
    RETURNING *;
  `;
  return result[0]; // will be undefined if no classroom found
};

// Add one lesson mapping from course_lesson into classroom_course_lesson
export const addClassroomLesson = async (classroomId, clId) => {
    const classroomLesson = await sql`
        INSERT INTO "LMS".classroom_course_lesson 
            (crcl_cr_id, crcl_cl_id)
        VALUES
            (${classroomId}, ${clId})
        RETURNING *;
    `;
    console.log("Added classroom lesson:", classroomLesson[0]);
    return classroomLesson[0];
};

// Remove all lessons for a classroom
export const removeClassroomLessons = async (classroomId) => {
    const removed = await sql`
        DELETE FROM "LMS".classroom_course_lesson 
        WHERE crcl_cr_id = ${classroomId}
        RETURNING *;
    `;
    return removed;
};

export const addClassroomStudent = async (classroomId, stuCourseId) => {
    const classroomStudent = await sql`
        INSERT INTO "LMS".classroom_student 
            (cr_id, stucourse_id)
        VALUES
            (${classroomId}, ${stuCourseId})
        RETURNING *;
    `;
    console.log("Added classroom student:", classroomStudent[0]);
    return classroomStudent[0];
};

export const removeClassroomStudent = async (classroomId, stuCourseId) => {
    const classroomStudent = await sql`
        DELETE FROM "LMS".classroom_student
        WHERE cr_id = ${classroomId} AND stucourse_id = ${stuCourseId}
        RETURNING *;
    `;
    return classroomStudent[0];
};

export const removeClassroomStudents = async (classroomId) => {
    const removed = await sql`
        DELETE FROM "LMS".classroom_student 
        WHERE cr_id = ${classroomId}
        RETURNING *;
    `;
    return removed;
};

export const updateClassroomStudents = async (classroomCode, students) => {
    await removeClassroomStudents(classroomCode)

    const classroomStudents = [];
    for (const student of students)
    {
        const addedStudent = await addClassroomStudent(classroomCode, student.stucourse_id);
        classroomStudents.push(addedStudent);
    }

    return classroomStudents;
}

// Get classrooms enrolled by a specific student
export const getClassroomsByStudent = async (studentId) => {
  const classrooms = await sql`
                        SELECT 
                        cr.*,
                        c.*,
                        usv.user_fname AS supervisor_fname,
                        usv.user_lname AS supervisor_lname,
                        uc.user_fname AS creator_fname,
                        uc.user_lname AS creator_lname,
                        cs.cs_id,
                        sc.stucourse_id
                    FROM "LMS".student_course sc
                    JOIN "LMS".classroom_student cs 
                        ON sc.stucourse_id = cs.stucourse_id
                    JOIN "LMS".classroom cr 
                        ON cs.cr_id = cr.cr_id
                    LEFT JOIN "LMS".course c 
                        ON cr.course_code = c.course_code
                    LEFT JOIN "LMS".instructor isv 
                        ON cr.supervisor_id = isv.inst_user_id
                    LEFT JOIN "LMS".user usv 
                        ON isv.inst_user_id = usv.user_id
                    LEFT JOIN "LMS".instructor ic 
                        ON cr.cr_creator = ic.inst_user_id
                    LEFT JOIN "LMS".user uc 
                        ON ic.inst_user_id = uc.user_id
                    WHERE sc.stu_user_id = ${studentId};`

  return classrooms;
};

// temp draft sql - update in cl_stu_lesson table
export const editStudentMarksForClassroomLesson = async (cr_id, crcl_cl_id, student) => {
    const { stucourse_id, attendance, completion, grade } = student;

    const result = await sql`
        INSERT INTO "LMS".cl_stu_lesson (cs_id, crcl_id, csl_attendance, csl_completion, csl_grade)
        VALUES (
        (SELECT cs_id FROM "LMS".classroom_student WHERE cr_id = ${cr_id} AND stucourse_id = ${stucourse_id}),
        (SELECT crcl_id FROM "LMS".classroom_course_lesson WHERE crcl_cr_id = ${cr_id} AND crcl_cl_id = ${crcl_cl_id}),
        ${attendance},
        ${completion},
        ${grade}
        )
        ON CONFLICT (cs_id, crcl_id) DO UPDATE SET
        csl_attendance = EXCLUDED.csl_attendance,
        csl_completion = EXCLUDED.csl_completion,
        csl_grade = EXCLUDED.csl_grade
        RETURNING *;
    `;

    return result[0];
}

export const getLessonsWithStudentsByClassroom = async (cr_id) => {
    const lessonsWithStudents = await sql`SELECT 
                                crcl.crcl_cl_id,
                                l.lesson_id,
                                l.lesson_title,
                                l.lesson_credit,
                                (
                                    -- all students in this classroom, with lesson-specific progress
                                    SELECT json_agg(
                                        json_build_object(
                                            'stucourse_id', sc.stucourse_id,
                                            'stu_user_id', s.stu_user_id,
                                            'stu_user_fname', u.user_fname,
                                            'stu_user_lname', u.user_lname,
                                            'stu_user_email', u.user_email,
                                            'attendance', csl.csl_attendance,
                                            'completion', csl.csl_completion,
                                            'grade', csl.csl_grade
                                        )
                                    )
                                    FROM "LMS".classroom_student cs
                                    JOIN "LMS".student_course sc ON cs.stucourse_id = sc.stucourse_id
                                    JOIN "LMS".student s ON sc.stu_user_id = s.stu_user_id
                                    JOIN "LMS".user u ON s.stu_user_id = u.user_id
                                    LEFT JOIN "LMS".cl_stu_lesson csl 
                                        ON csl.cs_id = cs.cs_id 
                                        AND csl.crcl_id = crcl.crcl_id
                                    WHERE cs.cr_id = cr.cr_id
                                ) AS students
                            FROM "LMS".classroom cr
                            JOIN "LMS".classroom_course_lesson crcl ON cr.cr_id = crcl.crcl_cr_id
                            JOIN "LMS".course_lesson cl ON crcl.crcl_cl_id = cl.cl_id
                            JOIN "LMS".lesson l ON cl.cl_lesson_id = l.lesson_id
                            WHERE cr.cr_id = ${cr_id}
                            GROUP BY crcl.crcl_id, l.lesson_id, l.lesson_title, l.lesson_credit, cr.cr_id;
`;

    return lessonsWithStudents;

}

export const addClassroomStudentLesson = async (cs_id, crcl_id) => {
  const result = await sql`
    INSERT INTO "LMS".cl_stu_lesson (cs_id, crcl_id)
    VALUES (${cs_id}, ${crcl_id})
    RETURNING *;
  `;
  return result[0];
};

