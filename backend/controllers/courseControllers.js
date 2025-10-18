import { getAllCourses, getCoursesByInstructor, getCourseByCode, createCourse, deleteCourse, updateCourse, addCourseLesson, updateCourseLessons, getEnrolledCoursesByStudent, getAvailableCoursesForStudent, addCourseEnrollment, getPublishedCourses, getAllStudentsByCourseEnrolled, addStudentLessonsForCourse } from "../models/course.js";

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
    /*
        Pre-conditions: User must be authenticated and have role "student"
                        i.e. req has user object with id and role "student"
        
        Return:
            Return a response containing all courses that the student is enrolled in:
            With res status 200 and JSON body { success: true, data: [{enrolled_course1}, {enrolled_course2}, ...] }

            Or 

            (If there is an error)
            Return a response:
            With res status 500 and JSON body { success: false, message: "Failed to fetch enrolled courses for student." }
    */
    const studentId = req?.user?.id;
    console.log(studentId);
    if (!studentId) return res.status(401).json({success: false, error: "Unauthorized" });

    try {
        const courses = await getEnrolledCoursesByStudent(studentId);
        
        return res.status(200).json({ success: true, data: courses || [] });
    }
    catch (error) {
        console.error("Error fetching courses by student:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch enrolled courses for student." });
    }
};

export const getAvailableCoursesForEnrollment = async (req, res) => {
    /*
        Pre-conditions: User must be authenticated and have role "student"
        
        Return:
            Return all published courses that the student is not enrolled in yet.
            With res status 200 and JSON body { success: true, data: [...] }

            Or 

            (If there is an error)
            With res status 500 and JSON body { success: false, message: "Failed to fetch available courses for student." }
    */
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

export const enrollCourse = async (req, res) => {
    try {
        const { courseCode } = req.params;
        const studentId = req?.user?.id;
        if (!studentId) return res.status(401).json({ success: false, error: "Unauthorized" });
        if (!courseCode) return res.status(400).json({ success: false, message: "Course code is required." });

        const enrollment = await addCourseEnrollment(studentId, courseCode);
        console.log(enrollment);
        if (!enrollment) {
            return res.status(409).json({ success: false, message: "Failed to enroll in course." });
        }

        const enrolledLessons = await addStudentLessonsForCourse(studentId, courseCode);

        if (!enrolledLessons) {
            return res.status(409).json({ success: false, message: "Failed to enroll in lessons for course." });
        }
        return res.status(201).json({ success: true, data: enrollment, message: "Enrolled successfully." });
    }
    catch (error) {
        console.error("Error enrolling course:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
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
    const { code, title, creator, lessons, status, credit  } = req.body;
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

        // const total_credit = lessons.reduce((sum, lesson) => sum + (lesson.lesson_credit || 0), 0);

        const courseData = {
            code,
            title,
            total_credit: credit,
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
        // if (updateData.lessons && Array.isArray(updateData.lessons)) {
        //     updateData.course_total_credit = updateData.lessons.reduce(
        //         (sum, lesson) => sum + (lesson.lesson_credit || 0),
        //         0
        //     );
        // }

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

export const updateCourseLessonAssignments = async (req, res) => {
    const { courseCode } = req.params;
    const { lessons } = req.body; // expecting an array of lessons [{ lesson_id, lesson_credit, ... }]

    if (!Array.isArray(lessons)) {
        return res.status(400).json({ success: false, message: "Lessons must be provided as an array" });
    }

    try {
        // update course_lesson records
        const updatedLessons = await updateCourseLessons(courseCode, lessons);

        // recalc total credit
        const totalCredit = lessons.reduce(
            (sum, lesson) => sum + (lesson.lesson_credit || 0),
            0
        );

        // update the course table with the new total credit + date updated
        const updatedCourse = await updateCourse({
            id: courseCode,
            updateData: {
                course_total_credit: totalCredit,
                course_date_updated: new Date().toISOString().split("T")[0]
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                ...updatedCourse,
                lessons: updatedLessons
            }
        });
    } catch (error) {
        console.error("Error updating course lessons:", error);
        return res.status(500).json({ success: false, message: "Failed to update course lessons" });
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