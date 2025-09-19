import sql from "../db.js";

export const getAllClassrooms = async () => {
    const classrooms = await sql`SELECT * FROM "LMS".classroom;`;
    return classrooms;
}

export const getClassroomsByInstructor = async (instructorId) => {
    const classrooms = await sql`SELECT * FROM "LMS".classroom WHERE cr_creator = ${instructorId};`;
    return classrooms;
}

export const getClassroomByCode = async (classroomCode) => {
    const classroom = await sql`
                        SELECT 
                            cr.*,
                            c.*,
                            ic.inst_user_id AS creator_inst_id,
                            uc.user_fname AS creator_fname,
                            uc.user_lname AS creator_lname,
                            isv.inst_user_id AS supervisor_inst_id,
                            usv.user_fname AS supervisor_fname,
                            usv.user_lname AS supervisor_lname,
                            COALESCE(
                            json_agg(
                                json_build_object(
                                'lesson_id', l.lesson_id,
                                'lesson_title', l.lesson_title,
                                'lesson_credit', l.lesson_credit,
                                'lesson_designer', l.lesson_designer
                                )
                            ) FILTER (WHERE l.lesson_id IS NOT NULL),
                            '[]'::json
                            ) AS lessons
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
                        LEFT JOIN "LMS".classroom_course_lesson crcl
                            ON cr.cr_id = crcl.crcl_cr_id
                        LEFT JOIN "LMS".course_lesson cl
                            ON crcl.crcl_cl_id = cl.cl_id
                        LEFT JOIN "LMS".lesson l 
                            ON cl.cl_lesson_id = l.lesson_id
                        WHERE cr.cr_id = ${classroomCode}
                        GROUP BY cr.cr_id, c.course_code, ic.inst_user_id, uc.user_fname, uc.user_lname, isv.inst_user_id, usv.user_fname, usv.user_lname;
                        `;
    return classroom[0];
}

export const deleteClassroom = async (classroomId) => {
    const courses = await sql`DELETE FROM "LMS".course WHERE course_code = ${classroomId} RETURNING *;`;
    return courses[0];
}

export const updateClassroom = async (classroomData) => {
    const {id, updateData} = classroomData;
    console.log(classroomData);
    const classrooms = await sql`UPDATE "LMS".classroom 
                    SET 
                        cr_id = ${updateData.cr_id},
                        cr_start_date = ${updateData.cr_start_date},
                        cr_duration = ${updateData.cr_duration},
                        cr_date_created = ${updateData.cr_date_created},
                        cr_last_updated = ${updateData.cr_last_updated},
                        cr_creator = ${updateData.cr_creator},
                        supervisor_id = ${updateData.supervisor_id},
                        course_code = ${updateData.course_code}
                    WHERE course_code = ${id} 
                    RETURNING *;`;
    return classrooms[0];
}