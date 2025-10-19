import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../libs/apiCalls";
import "../styles/Reports.css";
import useStore from "../store";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

function Reports() {
  const [activePage, setActivePage] = useState("reports");
  const { user, signOut } = useStore((state) => state);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const STATUS_COLORS = {
    "Not Enrolled": "#f39c12",
    "Ongoing": "#3498db",
    "Completed": "#27ae60",
    Null: "#bdc3c7",
  };

  //  Ensure axios always has the Bearer token
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      if (token) setAuthToken(token);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    signOut();
    navigate("/");
  };

  //  Fetch all statistics once token is ready
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [totalRes, breakdownRes, avgRes, userStatsRes] = await Promise.all([
          api.get("/classroomStatistics/total"),
          api.get("/classroomStatistics/status-breakdown"),
          api.get("/classroomStatistics/average-students"),
          api.get("/userStatistics/users"),
        ]);

        const total = totalRes.data?.data ?? {};
        const breakdown = breakdownRes.data?.data ?? {};
        const avg = avgRes.data?.data ?? {};
        const userStats = userStatsRes.data?.data ?? {};

        console.log("User stats response:", userStatsRes.data);

        setStats({
          total_classrooms: total.total_classrooms ?? 0,
          not_started: breakdown.not_started ?? 0,
          ongoing: breakdown.ongoing ?? 0,
          ended: breakdown.ended ?? 0,
          avg_students: avg.avg_students ?? 0,
          total_students: userStats.totalStudents ?? 0,
          students_not_enrolled: userStats.totalNotEnrolled ?? 0,
          students_ongoing: userStats.totalInOngoingCourse ?? 0,
          students_completed: userStats.totalCompletedAllCourses ?? 0,
          total_instructors: userStats.totalInstructors ?? 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);

        // ✅ handle unauthorized access
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError("Access denied. You do not have permission to view this data.");
        } else {
          setError("Failed to load classroom statistics.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

    // Pie chart data for student stats
  const studentPieData = [
    { name: "Not Enrolled", value: stats?.students_not_enrolled ?? 0 },
    { name: "Ongoing", value: stats?.students_ongoing ?? 0 },
    { name: "Completed", value: stats?.students_completed ?? 0 },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="profile">
          <div className="avatar"></div>
          <div className="info">
            <div className="name">
              {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}
            </div>
            <div className="role">{user ? user.user_role : "Loading..."}</div>
          </div>
        </div>

        <nav className="nav-menu">
          <button onClick={() => navigate("/courses")}>Courses</button>
          <button onClick={() => navigate("/lessons")}>Lessons</button>
          <button onClick={() => navigate("/classrooms")}>Classrooms</button>
          <button onClick={() => navigate("/students")}>Students</button>
          {(user?.user_role === "instructor" || user?.user_role === "admin") && (
            <button
              className={activePage === "reports" ? "active" : ""}
              onClick={() => navigate("/reports")}
            >
              Reports & Statistics
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <h1>Reports & Statistics</h1>
        </div>

        <div className="content">
          {loading ? (
            <p>Loading classroom statistics...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : !stats ? (
            <p>No classroom data available yet.</p>
          ) : (
            <div className="stats-container">
              <h2 className="stats-title">Classroom Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Classrooms</h3>
                  <p>{stats.total_classrooms}</p>
                </div>
                <div className="stat-card">
                  <h3>Not Started</h3>
                  <p>{stats.not_started}</p>
                </div>
                <div className="stat-card">
                  <h3>Ongoing</h3>
                  <p>{stats.ongoing}</p>
                </div>
                <div className="stat-card">
                  <h3>Ended</h3>
                  <p>{stats.ended}</p>
                </div>
                <div className="stat-card">
                  <h3>Average Students per Classroom</h3>
                  <p>{stats.avg_students}</p>
                </div>
              </div>

              {/* Student Statistics */}
              <h2 className="stats-title" style={{ marginTop: "2rem" }}>
                Student Statistics
              </h2>

              <div className="student-stats-row">
                {/* Total Students Box */}
                <div className="stat-card big-card">
                  <h3>Total Students</h3>
                  <p className="big-number">{stats.total_students}</p>
                </div>

                {/* Pie Chart Box */}
                <div className="stat-card pie-card">
                  <h3>Enrollment Breakdown</h3>
                  <PieChart width={280} height={280}>
                    <Pie
                      data={[
                        { name: "Not Enrolled", value: stats.students_not_enrolled },
                        { name: "Ongoing", value: stats.students_ongoing },
                        { name: "Completed", value: stats.students_completed },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label
                    >
                        {studentPieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[entry.name] || STATUS_COLORS.Null}
                          />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              </div>
        

              {user?.user_role === "admin" && (
                <>
                  <h2 className="stats-title" style={{ marginTop: "2rem" }}>
                    Instructor Statistics
                  </h2>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h3>Total Instructors</h3>
                      <p>{stats.total_instructors}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
