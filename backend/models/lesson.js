// import sql from "../db.js";

// export const getAllLessons = async () => {
//     const lessons = await sql`SELECT * FROM "LMS".lesson;`;
//     return lessons;
// }

// export const getLessonById = async (lessonId) => {
//     const lesson = await sql`SELECT * FROM "LMS".lesson l 
//                                 LEFT JOIN "LMS".instructor i ON l.lesson_designer = i.inst_user_id
//                                 LEFT JOIN "LMS".user u ON u.user_id = i.inst_user_id
//                                 WHERE l.lesson_id = ${lessonId}
//                             ;`;
//     return lesson[0];
// }

// export const getLessonByInstructor = async (instructorId) => {
//     const lessons = await sql`SELECT * FROM "LMS".lesson WHERE lesson_designer = ${instructorId};`;
//     return lessons;
// }

// export const updateLesson = async (lessonData) => {
//     const { id, updateData } = lessonData;

//     const fields = [];
//     if (updateData.lesson_title) fields.push(sql`lesson_title = ${updateData.lesson_title}`);
//     if (updateData.lesson_credit) fields.push(sql`lesson_credit = ${updateData.lesson_credit}`);
//     if (updateData.lesson_designer) fields.push(sql`lesson_designer = ${updateData.lesson_designer}`);
//     if (updateData.lesson_status) fields.push(sql`lesson_status = ${updateData.lesson_status}`);
//     if (updateData.lesson_date_updated) fields.push(sql`lesson_date_updated = ${updateData.lesson_date_updated}`);

//     if (fields.length === 0) return null; // nothing to update

//     const lessons = await sql`
//         UPDATE "LMS".lesson
//         SET ${sql.join(fields, sql`, `)}
//         WHERE lesson_id = ${id}
//         RETURNING *;
//     `;
//     return lessons[0];
// };

import sql from "../db.js";

// Get all lessons
export const getAllLessons = async () => {
  const lessons = await sql`SELECT * FROM "LMS".lesson ORDER BY lesson_id ASC;`;
  return lessons;
};

// Get lesson by ID
export const getLessonById = async (lessonId) => {
  const lesson = await sql`
    SELECT * FROM "LMS".lesson l 
    LEFT JOIN "LMS".instructor i ON l.lesson_designer = i.inst_user_id
    LEFT JOIN "LMS".user u ON u.user_id = i.inst_user_id
    WHERE l.lesson_id = ${lessonId};
  `;
  return lesson[0];
};

// Get lessons by instructor
export const getLessonByInstructor = async (instructorId) => {
  const lessons = await sql`
    SELECT * FROM "LMS".lesson 
    WHERE lesson_designer = ${instructorId};
  `;
  return lessons;
};

// Create lesson
export const createLesson = async (lessonData) => {
  const lesson = await sql`
    INSERT INTO "LMS".lesson 
      (lesson_title, lesson_desc, lesson_obj, lesson_effort_per_week, lesson_date_created, lesson_date_updated, lesson_credit, lesson_designer, lesson_status)
    VALUES 
      (${lessonData.lesson_title}, ${lessonData.lesson_desc}, ${lessonData.lesson_obj}, ${lessonData.lesson_effort_per_week}, ${lessonData.lesson_date_created}, ${lessonData.lesson_date_updated}, ${lessonData.lesson_credit}, ${lessonData.lesson_designer}, ${lessonData.lesson_status})
    RETURNING *;
  `;
  return lesson[0];
};

// Update lesson
export const updateLesson = async (lessonId, lessonData) => {
  console.log(`ABCABCC: ${lessonData}`);

    // Always update date_updated on the backend
    const today = new Date().toISOString().split("T")[0];

    const lessons = await sql`
        UPDATE "LMS".lesson
        SET 
            lesson_title = ${lessonData.lesson_title},
            lesson_desc = ${lessonData.lesson_desc},
            lesson_obj = ${lessonData.lesson_obj},
            lesson_effort_per_week = ${lessonData.lesson_effort_per_week},
            lesson_credit = ${lessonData.lesson_credit},
            lesson_prereq = ${lessonData.lesson_prereq},
            lesson_reading_list = ${lessonData.lesson_reading_list},
            lesson_assignment = ${lessonData.lesson_assignment},
            lesson_status = ${lessonData.lesson_status},
            lesson_date_updated = ${today}
        WHERE lesson_id = ${lessonId}
        RETURNING *;
    `;
    
    return lessons[0];
};

export const deleteLesson = async (lessonId) => {
    const lesson = await sql`DELETE FROM "LMS".lesson WHERE lesson_id = ${lessonId} RETURNING *;`;
    return lesson[0];
}