import {getAllLessons, getLessonById, getLessonByInstructor} from "../models/lesson.js";
export const getLessons = async (req, res) => {
    try {
        const lessons = await getAllLessons();
        console.log("Lessons fetched:", lessons);
        return res.status(200).json({ success: true, data: lessons });
    }
    catch (error) {
        console.error("Error fetching lessons:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch lessons." });
    }
};

export const getLesson = async (req, res) => {
    const { id } = req.params;
    try {
        const lesson = await getLessonById(id);
        if (lesson) {
            return res.status(200).json({ success: true, data: lesson });
        }
        return res.status(404).json({ success: false, message: "Lesson not found." });
    }
    catch (error) {
        console.error("Error fetching lesson:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch lesson." });
    }
};

export const getLessonsByInstructor = async (req, res) => {
    const { instructorId } = req.params;
    try {
        const lessons = await getLessonByInstructor(instructorId);
        if (lessons.length > 0) {
            return res.status(200).json({ success: true, data: lessons });
        }
        return res.status(404).json({ success: false, message: "No lessons found for this instructor." });
    }
    catch (error) {
        console.error("Error fetching lessons by instructor:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch lessons by instructor." });
    }
};