import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    signOut();
    navigate("/");
  };

    useEffect(() => {
    const fetchStats = async () => {
        try {
        setLoading(true);
        setError(null);

        // Fetch all three stats in parallel
        const [totalRes, breakdownRes, avgRes] = await Promise.all([
          api.get("/classroomStatistics/total"),
          api.get("/classroomStatistics/status-breakdown"),
          api.get("/classroomStatistics/average-students")
        ]);

        const total = totalRes.data?.data ?? {};
        const breakdown = breakdownRes.data?.data ?? {};
        const avg = avgRes.data?.data ?? {};

        setStats({
            total_classrooms: total.total_classrooms ?? 0,
            not_started: breakdown.not_started ?? 0,
            ongoing: breakdown.ongoing ?? 0,
            ended: breakdown.ended ?? 0,
            avg_students: avg.avg_students ?? 0,
        });
        } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load classroom statistics.");
        } finally {
        setLoading(false);
        }
    };

    if (user) fetchStats();
    }, [user]);

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
              <div className="stats-row">
                {/* Left: Total Classrooms */}
                <div className="stat-card">
                  <h3>Total Classrooms</h3>
                  <p>{stats.total_classrooms ?? 0}</p>
                </div>

                {/* Middle: Pie Chart */}
                <div className="piechart-section">
                  <h3>Status Breakdown</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={[
                          { name: "Not Started", value: stats.not_started ?? 0 },
                          { name: "Ongoing", value: stats.ongoing ?? 0 },
                          { name: "Ended", value: stats.ended ?? 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        <Cell fill="#f39c12" /> {/* Not Started */}
                        <Cell fill="#3498db" /> {/* Ongoing */}
                        <Cell fill="#2ecc71" /> {/* Ended */}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Right: Average Students */}
                <div className="stat-card">
                  <h3>Average Students per Classroom</h3>
                  <p>{stats.avg_students ?? 0}</p>
                </div>
              </div>
            </div>


          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
