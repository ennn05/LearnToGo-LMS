import {
  getAllClassrooms,
  getClassroomsByInstructor,
  getClassroomByCode,
  deleteClassroom,
  updateClassroom
} from "../models/classroom.js";

// ✅ Get all classrooms
export const getClassrooms = async (req, res) => {
  try {
    const classrooms = await getAllClassrooms();
    return res.status(200).json({ success: true, data: classrooms });
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch classrooms." });
  }
};

// ✅ Get instructor's classrooms
export const getInstructorClassrooms = async (req, res) => {
  const instructorId = req?.user?.id;
  if (!instructorId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const classrooms = await getClassroomsByInstructor(instructorId);
    return res.status(200).json({ success: true, data: classrooms });
  } catch (error) {
    console.error("Error fetching classrooms by instructor:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch classrooms by instructor." });
  }
};

// ✅ Get a classroom by code
export const getClassroom = async (req, res) => {
  const { code } = req.params;
  try {
    const classroom = await getClassroomByCode(code);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found." });
    }
    return res.status(200).json({ success: true, data: classroom });
  } catch (error) {
    console.error("Error fetching classroom:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch classroom." });
  }
};

// ✅ Delete a classroom
export const removeClassroom = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await deleteClassroom(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Classroom does not exist." });
    }
    return res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    console.error("Error deleting classroom:", error);
    return res.status(500).json({ success: false, message: "Failed to delete classroom." });
  }
};

// ✅ Update a classroom
export const editClassroom = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updated = await updateClassroom({ id, updateData });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Classroom does not exist." });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating classroom:", error);
    return res.status(500).json({ success: false, message: "Failed to update classroom." });
  }
};
