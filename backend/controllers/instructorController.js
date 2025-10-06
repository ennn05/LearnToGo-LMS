import { getAllInstructors, deleteInstructor } from "../models/instructor.js";

export const getInstructors = async (req, res) => {
    try {
        const instructors = await getAllInstructors();
        console.log("Instructors fetched:", instructors);
        return res.status(200).json({ success: true, data: instructors });
    } catch (error) {
        console.error("Error fetching instructors:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch instructors." });
    }
};

export const removeInstructor = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedInstructor = await deleteInstructor(id);
        if (deletedInstructor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Instructor does not exist.",
            });
        }
        deletedInstructor[0].user_password = undefined; // hide password
        console.log("Instructor deleted:", deletedInstructor[0]);
        return res.status(200).json({ success: true, data: deletedInstructor[0] });
    } catch (error) {
        console.error("Error in deleting instructor:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};
