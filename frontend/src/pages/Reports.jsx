import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Reports.css";
import useStore from "../store";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

function Reports() {
    const navigate = useNavigate();
    const { user, signOut } = useStore((state) => state);
    const [activePage, setActivePage] = useState("reports");
    const [totalCourses, setTotalCourses] = useState(null);
    const [avgLessons, setAvgLessons] = useState(null);
    const [statusBreakdown, setStatusBreakdown] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const STATUS_COLORS = {
        Published: "#27ae60",
        Draft: "#f39c12",
        Archived: "#95a5a6",
        Null: "#bdc3c7",
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        signOut();
        navigate("/login");
    };

    useEffect(() => {
        const fetchCourseReports = async () => {
            try {
                setLoading(true);
                const [totalRes, avgRes, breakdownRes] = await Promise.all([
                    api.get("/statistics/courses/total"),
                    api.get("/statistics/courses/average-lessons"),
                    api.get("/statistics/courses/status-breakdown"),
                ])
                if (!totalRes.data.success || !avgRes.data.success || !breakdownRes.data.success) {
                    throw new Error("Some reports could not be retrieved.");
                }
                setTotalCourses(totalRes.data.data.count);
                setAvgLessons(avgRes.data.data.avg_lessons_per_course);
                setStatusBreakdown(
                    breakdownRes.data.data.map(item => ({
                        name: item.status,
                        value: Number(item.course_count),
                    }))
                );
            } catch (err) {
                console.error("Error fetching course reports:", err);
                setError("Failed to load course reports.");
            } finally {
                setLoading(false);
            }
        };
        fetchCourseReports();
    }, []);

    if (loading) {
        return <div className="reports-loading">Loading course statistics...</div>;
    }

    if (error) {
        return <div className="reports-error">{error}</div>;
    }

    return (
        <div className="flex">
            {/** Sidebar */}
            <div className="sidebar">
                {/** Profile section */}
                <div className="profile">
                    <div className="avatar"></div>
                    <div className="info">
                        <div className="name">
                            {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}
                        </div>
                        <div className="role">
                            {user ? user.user_role : ""}
                        </div>
                    </div>
                </div>
                {/** Navigation menu */}
                <nav className="nav-menu">
                    <button
                        className={activePage === "courses" ? "active" : ""}
                        onClick={() => navigate("/courses")} 
                    >
                        Courses
                    </button>
                    <button
                        className={activePage === "lessons" ? "active" : ""}
                        onClick={() => navigate("/lessons")}
                    >
                        Lessons
                    </button>
                    <button
                        className={activePage === "classrooms" ? "active" : ""}
                        onClick={() => navigate("/classrooms")}
                    >
                        Classrooms
                    </button>
                    <button
                        className={activePage === "students" ? "active" : ""}
                        onClick={() => navigate("/students")}
                    >
                        Students
                    </button>
                    <button
                        className={activePage === "reports" ? "active" : ""}
                        onClick={() => navigate("/reports")}
                    >
                        Reports & Statistics
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        Log Out
                    </button>
                </nav>
            </div>
            {/** Main content */}
            <div className="main-content">
                {/** Topbar */}
                <div className="topbar">
                    <h1>Reports & Statistics</h1>
                </div>
                {/** Reports containers */}
                <div className="reports-container">
                    {/** Course Reports */}
                    <h1 className="reports-title">Course Reports</h1>
                    <h2 className="reports-subtitle">{user?.user_role}: {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}</h2>
                    <div className="reports-row">
                        <div className="reports-card">
                            <h3>Total Courses</h3>
                            <p className="reports-number">{totalCourses ?? "N/A"}</p>
                        </div>
                        <div className="reports-card reports-pie">
                            <h3>Courses by Status</h3>
                            {statusBreakdown.length === 0 ? (
                                <p>No courses found.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={statusBreakdown}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {statusBreakdown.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={STATUS_COLORS[entry.name] || STATUS_COLORS["Null"]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="reports-card">
                            <h3>Average Lessons per Course</h3>
                            <p className="reports-number">{avgLessons ?? "N/A"}</p>
                        </div>
                    </div>
                    {/** Additional reports can be added here in the future */}
                </div>
            </div>
        </div>
    );
}

export default Reports;
