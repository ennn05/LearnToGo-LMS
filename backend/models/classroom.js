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
    //const classrooms = await sql
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