import { getAllCourses, getCoursesByInstructor, getCourseByCode, createCourse, deleteCourse } from "../models/course.js";

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

export const addCourse = async (req, res) => {
    const { code, title, creator, lessons  } = req.body;
    try {
        if (!code || !title)
        {
            return res.status(400).json({ success: false, message: "Course code and title are required" });
        }

        const existCourse = await getCourseByCode(code);
        if (existCourse) 
        {
            return res.status(400).json({ success: false, message: "Course code already exists" });
        }

        const today = new Date().toISOString().split('T')[0];

        const total_credit = lessons.reduce((sum, lesson) => sum + (lesson.credit || 0), 0);

        const courseData = {
            code,
            title,
            total_credit,
            date_created: today,
            date_updated: today,
            creator,
            status: 'draft',
        };

        const course = await createCourse(courseData);
        if (course) {
            return res.status(200).json({ success: true, data: course });
        }
        return res.status(404).json({ success: false, message: "Course not found." });
    }
    catch (error) {
        console.error("Error in creating course:", error);
        return res.status(500).json({ success: false, message: "Failed to create course." });
    }
};


export const removeCourse = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCourse = await deleteCourse(id);
        if (!deletedCourse) 
        {
            return res.status(404).json({ success: false, message: "Course does not exist" });
        }
        return res.status(200).json({ success: true, data: deletedCourse });
    }
    catch (error) {
        console.error("Error in deleting course:", error);
        return res.status(500).json({ success: false, message: "Failed to delete course." });
    }
};
