import sql from "../db.js";

const TABLE_NAME = '"LMS".lesson';

export const getAllLessons = async () => {
    const lessons = await sql`SELECT * FROM "LMS".lesson;`;
    return lessons;
}

export const getLessonById = async (lessonId) => {
    const lesson = await sql`SELECT * FROM ${TABLE_NAME} WHERE lesson_id = ${lessonId};`;
    return lesson[0];
}

export const getLessonByInstructor = async (instructorId) => {
    const lessons = await sql`SELECT * FROM ${TABLE_NAME} WHERE lesson_designer = ${instructorId};`;
    return lessons;
}
