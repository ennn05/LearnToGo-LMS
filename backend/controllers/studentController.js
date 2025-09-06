import {getAllStudents} from "../models/student.js";

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