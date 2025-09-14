import { getAllCourses, getCoursesByInstructor, getCourseByCode, createCourse, deleteCourse, updateCourse, addCourseLesson, updateCourseLessons, getEnrolledCoursesByStudent, getAvailableCoursesForStudent } from "../models/course.js";

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

export const getStudentCourses = async (req, res) => {
    console.log("HI")
    const studentId = req?.user?.id;
    console.log(studentId);
    if (!studentId) return res.status(401).json({success: false, error: "Unauthorized" });

    try {
        const courses = await getEnrolledCoursesByStudent(studentId);
        return res.status(200).json({ success: true, data: courses });
    }
    catch (error) {
        console.error("Error fetching courses by student:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch courses by student." });
    }
};

export const getAvailableCoursesForEnrollment = async (req, res) => {
    const studentId = req?.user?.id;
    if (!studentId) return res.status(401).json({ success: false, error: "Unauthorized" });

    try {
        const courses = await getAvailableCoursesForStudent(studentId);
        return res.status(200).json({ success: true, data: courses });
    }
    catch (error) {
        console.error("Error fetching available courses for student:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch available courses for student." });
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
    const { id } = req.params;
    const updateData = req.body;
    console.log(`Update data: ${updateData}`);
    console.log(`Update data lessons: ${updateData.lessons}`);

    // try {
    //     updateData.lessons = JSON.parse(updateData.lessons);
    // } catch (e) {
    //     console.error("Invalid lessons JSON:", updateData.lessons);
    //     updateData.lessons = [];
    // }
    // console.log(`Update data: ${updateData}`);
    // console.log(`lessons: ${updateData.lessons}`);

    try {
        
        // const total_credit = updateData.lessons.reduce((sum, lesson) => sum + (lesson.lesson_credit || 0), 0);
        // updateData.course_total_credit = total_credit;
        const updatedCourse = await updateCourse({id, updateData});
        if (!updatedCourse) 
        {
            return res.status(404).json({ success: false, message: "Course does not exist" });
        }

        return res.status(200).json({ success: true, data: updateData });
        // try {
        //     updateCourseLessons(id, updateData.lessons);
        //     return res.status(200).json({ success: true, data: updatedCourse });

        // } catch (error)
        // {
        //     console.error("Error in updating course lessons:", error);
        //     return res.status(500).json({ success: false, message: "Failed to update course lessons." });

        // }
    }
    catch (error) {
        console.error("Error in updating course:", error);
        return res.status(500).json({ success: false, message: "Failed to update course." });
    }
};

