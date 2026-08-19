import {getAllLessons, getLessonById, getLessonByInstructor, updateLesson, deleteLesson, createLesson, getLessonsByStudent, getPublishedLessons, getStudentLessonById } from "../models/lesson.js";

export const getLessons = async (req, res) => {
    try {
        const lessons = await getAllLessons();
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


export const getStudentLesson = async (req, res) => {
    const { id } = req.params;
    const studentId = req?.user?.id;
    if (!studentId) return res.status(401).json({success: false, error: "Unauthorized" });

    try {
        const lesson = await getStudentLessonById(studentId, id);
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

export const getStudentLessons = async (req, res) => {
  const { id } = req.user;
  try {
    const lessons = await getLessonsByStudent(id);
    return res.status(200).json({ success: true, data: lessons });
  }
  catch (error) {
    console.error("Error fetching lessons of students:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch lessons of students." });
  }
};

export const getLessonsByInstructor = async (req, res) => {
    const { id } = req.user;
    try {
        const lessons = await getLessonByInstructor(id);
        return res.status(200).json({ success: true, data: lessons });
    }
    catch (error) {
        console.error("Error fetching lessons by instructor:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch lessons by instructor." });
    }
};

// Add lesson
export const addLesson = async (req, res) => {
  const { lesson_title, lesson_desc, lesson_obj, lesson_effort_per_week, lesson_credit, lesson_designer, lesson_status, lesson_prereq, lesson_reading_list, lesson_assignment } = req.body;
  try {
    const today = new Date().toISOString().split("T")[0];
    const lessonData = {
      lesson_title,
      lesson_desc,
      lesson_obj,
      lesson_effort_per_week,
      lesson_date_created: today,
      lesson_date_updated: today,
      lesson_credit: lesson_credit,
      lesson_designer: lesson_designer,
      lesson_status,
      lesson_prereq,
      lesson_reading_list,
      lesson_assignment
    };
    const newLesson = await createLesson(lessonData);
    return res.status(201).json({ success: true, data: newLesson });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return res.status(500).json({ success: false, message: "Failed to create lesson." });
  }
};

// Update lesson (publish/archive/etc.)
export const editLesson = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const updatedLesson = await updateLesson(id, updateData);
    if (!updatedLesson) {
      return res.status(404).json({ success: false, message: "Lesson does not exist" });
    }
    return res.status(200).json({ success: true, data: updatedLesson });
  } catch (error) {
    console.error("Error updating lesson:", error);
    return res.status(500).json({ success: false, message: "Failed to update lesson." });
  }
};

// Delete lesson
export const removeLesson = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedLesson = await deleteLesson(id);
    if (!deletedLesson) {
      return res.status(404).json({ success: false, message: "Lesson does not exist" });
    }
    return res.status(200).json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return res.status(500).json({ success: false, message: "Failed to delete lesson." });
  }
};

// Get published lessons
export const getPublished = async (req, res) => {
  try {
    const lessons = await getPublishedLessons();
    return res.status(200).json({ success: true, data: lessons });
  } catch (error) {
    console.error("Error fetching published lessons:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch published lessons." });
  }
};
