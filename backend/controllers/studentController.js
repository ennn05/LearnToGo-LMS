import {getAllStudents, deleteStudent} from "../models/student.js";

export const getStudents = async (req, res) => {
    // console.log("GETTING");
    try {
        const students = await getAllStudents();
        console.log("Students fetched:", students);
        return res.status(200).json({ success: true, data: students });
    }
    catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch students." });
    }
}

export const removeStudent = async (req, res) => {
    const { id } = req.params;
    // console.log("GETTING");
    try {
        const deletedStudent = await deleteStudent(id);
        if (deletedStudent.length === 0)
        {
            return res.status(404).json({
                success: false,
                message: "Student does not exist.",
            });
        }
        console.log("Student deleted:", deleteStudent);
        return res.status(200).json({ success: true, data: deletedStudent[0] });
    }
    catch (error) {
        console.error("Error in deleting student:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}