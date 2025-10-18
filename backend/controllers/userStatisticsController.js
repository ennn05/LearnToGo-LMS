import {
  totalNumOfStudents,
  totalNumOfStudentsNotEnrolledInCourse,
  totalNumOfStudentsInOngoingCourse,
  totalNumOfStudentsCompletedAllCourses,
  totalNumOfInstructors,
} from "../models/statistics.js";

// Controller to fetch user statistics (for admin or instructor view)
export const getUserStatistics = async (req, res) => {
  try {
    const role = req.user?.role; // 'admin' or 'instructor'

    const [
      totalStudents,
      notEnrolled,
      ongoing,
      completedAll,
    ] = await Promise.all([
      totalNumOfStudents(),
      totalNumOfStudentsNotEnrolledInCourse(),
      totalNumOfStudentsInOngoingCourse(),
      totalNumOfStudentsCompletedAllCourses(),
    ]);

    let data = {
      totalStudents: Number(totalStudents[0].count),
      totalNotEnrolled: Number(notEnrolled[0].count),
      totalInOngoingCourse: Number(ongoing[0].ongoing_course),
      totalCompletedAllCourses: Number(completedAll.students_completed_all_courses),
    };

    if (role === 'admin') {
      const [totalInstructors] = await Promise.all([totalNumOfInstructors()]);
      data.totalInstructors = Number(totalInstructors[0].count);
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching user statistics:", err);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
};

