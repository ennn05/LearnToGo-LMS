import { countTotalNumCourses } from "../models/statistics";

export const getTotalNumCourses = async (req, res) => {
    try {
        const count = await countTotalNumCourses();

        if (count === null || count === undefined) {
            return res.status(404).json({
                success: false,
                message: "Course statistics not found.",
            });
        }
        
        return res.status(200).json({ success: true, data: count });
    }
    catch (error) {
        console.error("Error fetching total number of courses:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch total number of courses." });
    }
}