import {
  totalNumOfClassrooms,
  totalNumOfClassroomsByInstructor,
  numClassroomsCompleted,
  numClassroomsCompletedByInstructor,
  numClassroomOngoing,
  numClassroomOngoingByInstructor,
  numClassroomNotStarted,
  numClassroomNotStartedByInstructor,
  avgNumOfStuPerClassroomByInstructor,
  avgNumOfStuPerClassroom,
} from "../models/statistics.js";

//  Get total number of classrooms
export const getTotalNumClassrooms = async (req, res) => {
  try {
    const result = await totalNumOfClassrooms();
    const total = parseInt(result[0]?.count ?? 0);
    return res.status(200).json({ success: true, data: total });
  } catch (error) {
    console.error("Error fetching total classrooms:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch classroom statistics." });
  }
};

export const getTotalNumClassroomsByInstructor = async (req, res) => {
  const instructorId = req?.user?.id;
  if (!instructorId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const result = await totalNumOfClassroomsByInstructor(instructorId);
    const total = parseInt(result[0]?.count ?? 0);
    return res.status(200).json({ success: true, data: total });
  } catch (error) {
    console.error("Error fetching instructor classroom total:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch classroom statistics." });
  }
};

//  Breakdown by status (completed / ongoing / not started)
export const getClassroomStatusBreakdown = async (req, res) => {
  try {
    const completed = parseInt((await numClassroomsCompleted())[0]?.completed_classrooms ?? 0);
    const ongoing = parseInt((await numClassroomOngoing())[0]?.count ?? 0);
    const notStarted = parseInt((await numClassroomNotStarted())[0]?.count ?? 0);

    const breakdown = { completed, ongoing, notStarted };
    return res.status(200).json({ success: true, data: breakdown });
  } catch (error) {
    console.error("Error fetching classroom breakdown:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch classroom statistics." });
  }
};

export const getClassroomStatusBreakdownByInstructor = async (req, res) => {
  const instructorId = req?.user?.id;
  if (!instructorId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const completed = parseInt((await numClassroomsCompletedByInstructor(instructorId))[0]?.completed_classrooms ?? 0);
    const ongoing = parseInt((await numClassroomOngoingByInstructor(instructorId))[0]?.count ?? 0);
    const notStarted = parseInt((await numClassroomNotStartedByInstructor(instructorId))[0]?.count ?? 0);

    const breakdown = { completed, ongoing, notStarted };
    return res.status(200).json({ success: true, data: breakdown });
  } catch (error) {
    console.error("Error fetching instructor classroom breakdown:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch classroom statistics." });
  }
};

//  Average number of students per classroom
export const getAvgStudentsPerClassroom = async (req, res) => {
  const userRole = req?.user?.role;

  if (userRole !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden - Admin access required." });
  }

  try {
    const result = await avgNumOfStuPerClassroom();

    const avg = parseFloat(
      result?.[0]?.avg_students_per_classroom ??
      result?.avg_students_per_classroom ??
      0
    );

    return res.status(200).json({
      success: true,
      data: avg,
      role: "admin",
    });
  } catch (error) {
    console.error("Error fetching admin average students per classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch classroom statistics.",
    });
  }
};

export const getAvgStudentsPerClassroomOfInstructor = async (req, res) => {
  const instructorId = req?.user?.id;
  if (!instructorId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - Missing instructor ID." });
  }

  try {
    const result = await avgNumOfStuPerClassroomByInstructor(instructorId);

    const avg = parseFloat(
      result?.[0]?.avg_students_per_classroom ??
      result?.avg_students_per_classroom ??
      0
    );

    return res.status(200).json({
      success: true,
      data: avg,
      role: "instructor",
    });
  } catch (error) {
    console.error("Error fetching instructor's average students per classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor classroom statistics.",
    });
  }
};
