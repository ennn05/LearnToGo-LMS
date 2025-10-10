import { avgNumLessonsPerCourse, avgNumLessonsPerCourseByInstructor, countTotalNumCourses, countTotalNumCoursesByInstructor } from "../models/statistics.js";

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

export const getTotalNumCoursesOfInstructor = async (req, res) => {
    const instructorId = req?.user?.id;
    if (!instructorId) return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
        const count = await countTotalNumCoursesByInstructor(instructorId);

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

export const getAvgLessonsPerCourse = async (req, res) => {
    try {
        const avg = await avgNumLessonsPerCourse();

        if (avg === null || avg === undefined) {
            return res.status(404).json({
                success: false,
                message: "Course statistics not found.",
            });
        }
        
        return res.status(200).json({ success: true, data: avg });
    }
    catch (error) {
        console.error("Error fetching average number of lessons per courses:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch average number of lessons per courses." });
    }
}

export const getAvgLessonsPerCourseOfInstructor = async (req, res) => {
    const instructorId = req?.user?.id;
    if (!instructorId) return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
        const avg = await avgNumLessonsPerCourseByInstructor(instructorId);

        if (avg === null || avg === undefined) {
            return res.status(404).json({
                success: false,
                message: "Course statistics not found.",
            });
        }
        
        return res.status(200).json({ success: true, data: avg });
    }
    catch (error) {
        console.error("Error fetching average number of lessons per courses:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch average number of lessons per courses." });
    }
}