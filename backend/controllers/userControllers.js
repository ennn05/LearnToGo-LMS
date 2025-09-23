import { getAllInstructors } from "../models/user.js";

export const getInstructors = async (req, res) => {
  try {
    const instructors = await getAllInstructors();
    return res.status(200).json({ success: true, data: instructors });
  } catch (error) {
    console.error("Error fetching instructors:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch instructors." });
  }
};
