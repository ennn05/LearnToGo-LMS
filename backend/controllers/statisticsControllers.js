import { avgCreditPointsPerLesson, avgCreditPointsPerLessonByInstructor, avgNumLessonsPerCourse, avgNumLessonsPerCourseByInstructor, countLessonsByStatus, countLessonsByStatusByInstructor, countTotalNumCourses, countTotalNumCoursesByInstructor, countTotalNumLessons, countTotalNumLessonsByInstructor, numCourseBreakdownByStatus, numCourseBreakdownByStatusForInstructor } from "../models/statistics.js";

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

export const getNumCoursesBreakdownByStatus = async (req, res) => {
    try {
        const breakdown = await numCourseBreakdownByStatus();

        if (breakdown === null || breakdown === undefined) {
            return res.status(404).json({
                success: false,
                message: "Course statistics not found.",
            });
        }
        
        return res.status(200).json({ success: true, data: breakdown });
    }
    catch (error) {
        console.error("Error fetching number of courses by status:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch number of courses by status." });
    }
}


export const getNumCoursesBreakdownByStatusForInstructor = async (req, res) => {
    const instructorId = req?.user?.id;
    if (!instructorId) return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
        const breakdown = await numCourseBreakdownByStatusForInstructor(instructorId);

        if (breakdown === null || breakdown === undefined) {
            return res.status(404).json({
                success: false,
                message: "Course statistics not found.",
            });
        }
        
        return res.status(200).json({ success: true, data: breakdown });
    }
    catch (error) {
        console.error("Error fetching number of courses by status:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch number of courses by status." });
    }
}


export const getTotalNumLessons = async (req, res) => {
    try {
        const count = await countTotalNumLessons();

        if (count === null || count === undefined) {
            return res.status(404).json({
                success: false,
                message: "Lesson statistics not found.",
            });
        }
        
        return res.status(200).json({ success: true, data: count });
    }
    catch (error) {
        console.error("Error fetching total number of lessons:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch total number of lessons." });
    }
}

export const getTotalNumLessonsOfInstructor = async (req, res) => {
    const instructorId = req?.user?.id;
    if (!instructorId) return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
        const count = await countTotalNumLessonsByInstructor(instructorId);

        if (count === null || count === undefined) {
            return res.status(404).json({
                success: false,
                message: "Lesson statistics not found.",
            });
        }
        
        return res.status(200).json({ success: true, data: count });
    }
    catch (error) {
        console.error("Error fetching total number of lessons:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch total number of lessons." });
    }
}


export const getNumLessonsBreakdownByStatus = async (req, res) => {
    try {
        const breakdown = await countLessonsByStatus();

        if (breakdown === null || breakdown === undefined) {
            return res.status(404).json({
                success: false,
                message: "Lesson statistics not found.",
            });
        }
        
        return res.status(200).json({ success: true, data: breakdown });
    }
    catch (error) {
        console.error("Error fetching number of lessons by status:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch number of lessons by status." });
    }
}

export const getNumLessonsBreakdownByStatusForInstructor = async (req, res) => {
    const instructorId = req?.user?.id;
    if (!instructorId) return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
        const breakdown = await countLessonsByStatusByInstructor(instructorId);

        if (breakdown === null || breakdown === undefined) {
            return res.status(404).json({
                success: false,
                message: "Lesson statistics not found.",
            });
        }
        
        return res.status(200).json({ success: true, data: breakdown });
    }
    catch (error) {
        console.error("Error fetching number of lessons by status:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch number of lessons by status." });
    }
}

export const getAvgCpPerLesson = async (req, res) => {
    try {
        const avg = await avgCreditPointsPerLesson();

        if (avg === null || avg === undefined) {
            return res.status(404).json({
                success: false,
                message: "Lesson statistics not found.",
            });
        }
        
        return res.status(200).json({ success: true, data: avg });
    }
    catch (error) {
        console.error("Error fetching average credit points per lesson:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch average credit points per lesson." });
    }
}

export const getAvgCpPerLessonOfInstructor = async (req, res) => {
    const instructorId = req?.user?.id;
    if (!instructorId) return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
        const avg = await avgCreditPointsPerLessonByInstructor(instructorId);

        if (avg === null || avg === undefined) {
            return res.status(404).json({
                success: false,
                message: "Lesson statistics not found.",
            });
        }
        
        return res.status(200).json({ success: true, data: avg });
    }
    catch (error) {
        console.error("Error fetching average credit points per lesson:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch average credit points per lesson." });
    }
}