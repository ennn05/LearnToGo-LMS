import {getAllLessons, getLessonById, getLessonByInstructor, updateLesson, deleteLesson} from "../models/lesson.js";
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

// Add lesson
export const addLesson = async (req, res) => {
  const { title, description, objective, estimatedTime } = req.body;
  try {
    const today = new Date().toISOString().split("T")[0];
    const lessonData = {
      title,
      description,
      objective,
      estimatedTime,
      date_created: today,
      date_updated: today,
      status: "draft"
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
  console.log(`Update data ABCABC: ${updateData}`);
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

// import {
//   getAllLessons,
//   getLessonById,
//   getLessonByInstructor,
//   createLesson,
//   updateLesson,
//   deleteLesson
// } from "../models/lesson.js";

// // Get all lessons
// export const getLessons = async (req, res) => {
//   try {
//     const lessons = await getAllLessons();
//     console.log("Lessons fetched:", lessons);
//     return res.status(200).json({ success: true, data: lessons });
//   } catch (error) {
//     console.error("Error fetching lessons:", error);
//     return res.status(500).json({ success: false, message: "Failed to fetch lessons." });
//   }
// };

// // Get single lesson
// export const getLesson = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const lesson = await getLessonById(id);
//     if (lesson) {
//       return res.status(200).json({ success: true, data: lesson });
//     }
//     return res.status(404).json({ success: false, message: "Lesson not found." });
//   } catch (error) {
//     console.error("Error fetching lesson:", error);
//     return res.status(500).json({ success: false, message: "Failed to fetch lesson." });
//   }
// };

// // Get lessons by instructor
// export const getLessonsByInstructor = async (req, res) => {
//   const { instructorId } = req.params;
//   try {
//     const lessons = await getLessonByInstructor(instructorId);
//     if (lessons.length > 0) {
//       return res.status(200).json({ success: true, data: lessons });
//     }
//     return res.status(404).json({ success: false, message: "No lessons found for this instructor." });
//   } catch (error) {
//     console.error("Error fetching lessons by instructor:", error);
//     return res.status(500).json({ success: false, message: "Failed to fetch lessons by instructor." });
//   }
// };

// // Add lesson
// export const addLesson = async (req, res) => {
//   const { title, description, objective, estimatedTime } = req.body;
//   try {
//     const today = new Date().toISOString().split("T")[0];
//     const lessonData = {
//       title,
//       description,
//       objective,
//       estimatedTime,
//       date_created: today,
//       date_updated: today,
//       status: "draft"
//     };
//     const newLesson = await createLesson(lessonData);
//     return res.status(201).json({ success: true, data: newLesson });
//   } catch (error) {
//     console.error("Error creating lesson:", error);
//     return res.status(500).json({ success: false, message: "Failed to create lesson." });
//   }
// };

// // Edit lesson
// export const editLesson = async (req, res) => {
//   const { id } = req.params;
//   const updateData = req.body;
//   console.log(`Update data: ${updateData}`);
//   console.log(`Update data lessons: ${updateData.lessons}`);
//   try {
//     const updatedLesson = await updateLesson({id, updateData});
//     if (!updatedLesson) {
//       return res.status(404).json({ success: false, message: "Lesson does not exist" });
//     }
//     return res.status(200).json({ success: true, data: updatedLesson });
//   } catch (error) {
//     console.error("Error updating lesson:", error);
//     return res.status(500).json({ success: false, message: "Failed to update lesson." });
//   }
// };

// // Delete lesson
// export const removeLesson = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedLesson = await deleteLesson(id);
//     if (!deletedLesson) {
//       return res.status(404).json({ success: false, message: "Lesson does not exist" });
//     }
//     return res.status(200).json({ success: true, message: "Lesson deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting lesson:", error);
//     return res.status(500).json({ success: false, message: "Failed to delete lesson." });
//   }
// };
