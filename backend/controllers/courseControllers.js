import { getAllCourses, getCoursesByInstructor, getCourseByCode, createCourse, deleteCourse, updateCourse, addCourseLesson, updateCourseLessons, getPublishedCourses, getAllStudentsByCourseEnrolled} from "../models/course.js";

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
    const instructorId = req?.user?.id;
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
        console.log(course);
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
    const { code, title, creator, lessons, status  } = req.body;
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
            status
        };

        const course = await createCourse(courseData);
        if (course) {
            try {
                lessons.forEach(element => {
                    addCourseLesson(code, element);
                });

            } catch(error)
            {
                console.error("Error in adding lesson to course:", error);
                return res.status(500).json({ success: false, message: "Failed to add lesson to course." });
            }
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

export const editCourse = async (req, res) => {
    const { id } = req.params; // course_code
    const updateData = req.body;

    try {
        // If lessons are included, recalc course_total_credit
        if (updateData.lessons && Array.isArray(updateData.lessons)) {
            updateData.course_total_credit = updateData.lessons.reduce(
                (sum, lesson) => sum + (lesson.lesson_credit || 0),
                0
            );
        }

        // Update course metadata (title, status, etc.)
        const updatedCourse = await updateCourse({ id, updateData });
        if (!updatedCourse) {
            return res.status(404).json({ success: false, message: "Course does not exist" });
        }

        // Update lessons assignment if lessons were passed
        let updatedLessons = [];
        if (updateData.lessons && Array.isArray(updateData.lessons)) {
            updatedLessons = await updateCourseLessons(id, updateData.lessons);
        }

        return res.status(200).json({
            success: true,
            data: {
                ...updatedCourse,
                lessons: updatedLessons
            }
        });
    } catch (error) {
        console.error("Error in updating course:", error);
        return res.status(500).json({ success: false, message: "Failed to update course." });
    }
};


export const getPublished = async (req, res) => {
    try {
        const courses = await getPublishedCourses();
        return res.status(200).json({ success: true, data: courses });
    } 
    catch (error) {
        console.error("Error fetching published courses:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch published courses." });
    }
};

export const getEnrolledStudentsByCourse = async (req, res) => {
    const { courseCode } = req.params;
    try {
        const students = await getAllStudentsByCourseEnrolled(courseCode);
        return res.status(200).json({ success: true, data: students });
    } catch (error) {
        console.error("Error fetching enrolled students:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch enrolled students." });
    }
};