import { getAllCourses, getCoursesByInstructor, getCourseByCode } from "../models/course.js";

export const getCourses = async (req, res) => {
    try {
        const courses = await getAllCourses();
        console.log("Courses fetched:", courses);
        return res.status(200).json({ success: true, data: courses });
    }
    catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch courses." });
    }
};

export const getInstructorCourses = async (req, res) => {
    console.log("HI")
    const instructorId = req?.user?.user_id;
    console.log(instructorId);
    if (!instructorId) return res.status(401).json({success: false, error: "Unauthorized" });

    try {
        const courses = await getCoursesByInstructor(instructorId);
        return res.status(200).json({ success: true, data: courses });        
    }
    catch (error) {
        console.error("Error fetching courses by instructor:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch courses by instructor." });
    }
};

export const getCourse = async (req, res) => {
    const { id } = req.params;
    try {
        const course = await getCourseByCode(id);
        if (course) {
            return res.status(200).json({ success: true, data: course });
        }
        return res.status(404).json({ success: false, message: "Course not found." });
    }
    catch (error) {
        console.error("Error fetching course:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch course." });
    }
};
