import {
  totalNumOfStudents,
  totalNumOfStudentsNotEnrolledInCourse,
  totalNumOfStudentsInOngoingCourse,
  totalNumOfStudentsCompletedAllCourses,
  totalNumOfInstructors
} from "../models/statistics.js";

/**
 * Controller: getUserStatistics
 * For both Admin and Instructor roles
 */
export const getUserStatistics = async (req, res) => {
  try {
    const userRole = req.user?.role; // Assuming middleware sets req.user
    if (!userRole) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Common statistics for Admin & Instructor
    const totalStudents = await totalNumOfStudents();
    const studentsNotEnrolled = await totalNumOfStudentsNotEnrolledInCourse();
    const studentsOngoing = await totalNumOfStudentsInOngoingCourse();
    const studentsCompleted = await totalNumOfStudentsCompletedAllCourses();

    const statistics = {
      total_students: Number(
        (totalStudents?.count || totalStudents?.total || 0)
      ),
      students_not_enrolled: Number(
        (studentsNotEnrolled?.count || 0)
      ),
      students_ongoing: Number(
        (studentsOngoing?.ongoing_course || studentsOngoing?.count || 0)
      ),
      students_completed: Number(
        (studentsCompleted?.students_completed_all_courses || 0)
      ),
    };

    console.log(statistics.total_students);

    // Admin-only field
    if (userRole === "admin") {
      const instructors = await totalNumOfInstructors();
      statistics.total_instructors = Number(
        (instructors?.count || instructors?.total || 0)
      );
    }

    res.status(200).json({ success: true, statistics });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    res.status(500).json({ message: "Failed to load user statistics." });
  }
};