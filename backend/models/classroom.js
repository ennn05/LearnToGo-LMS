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

export const updateClassroom = async (classroomData) => {
    const {id, updateData} = classroomData;
    console.log(classroomData);
    const classrooms = await sql`UPDATE "LMS".classroom 
                    SET 
                        cr_start_date = ${updateData.cr_start_date},
                        cr_duration = ${updateData.cr_duration},
                        cr_date_created = ${updateData.cr_date_created},
                        cr_last_updated = ${updateData.cr_last_updated},
                        cr_creator = ${updateData.cr_creator},
                        supervisor_id = ${updateData.supervisor_id},
                        course_code = ${updateData.course_code},
                        cr_status = ${updateData.cr_status}
                    WHERE cr_id = ${id} 
                    RETURNING *;`;
    return classrooms[0];
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

export const deleteClassroom = async (classroomId) => {
    const courses = await sql`DELETE FROM "LMS".course WHERE course_code = ${classroomId} RETURNING *;`;
    return courses[0];
}

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

// Get classrooms enrolled by a specific student
export const getClassroomsByStudent = async (studentId) => {
  const classrooms = await sql`
    SELECT 
      cr.cr_id,
      cr.cr_code,
      cr.cr_status,
      cr.cr_start_date,
      cr.cr_duration,
      c.course_name,
      usv.user_fname || ' ' || usv.user_lname AS supervisor_name
    FROM "LMS".classroom cr
    JOIN "LMS".course c 
      ON cr.course_code = c.course_code
    LEFT JOIN "LMS".instructor isv 
      ON cr.supervisor_id = isv.inst_user_id
    LEFT JOIN "LMS".user usv 
      ON isv.inst_user_id = usv.user_id
    JOIN "LMS".classroom_student cs
      ON cr.cr_id = cs.cr_id
    WHERE cs.stu_user_id = ${studentId}
    ORDER BY cr.cr_start_date DESC;
  `;
  return classrooms;
};
