import { getAllInstructors, deleteInstructorbyAdmin } from "../models/user.js";

export const getInstructors = async (req, res) => {
  try {
    const instructors = await getAllInstructors();
    return res.status(200).json({ success: true, data: instructors });
  } catch (error) {
    console.error("Error fetching instructors:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch instructors." });
  }
};

export const removeInstructor = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteInstructorbyAdmin(id);

    if (!result) {
      return res.status(404).json({ success: false, message: "Instructor not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Instructor has been removed successfully.",
    });
  } catch (error) {
    console.error("Error removing instructor:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove instructor. Please try again later.",
    });
  }
};
