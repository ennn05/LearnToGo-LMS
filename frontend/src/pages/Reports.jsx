import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../libs/apiCalls";
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
    const [totalLessons, setTotalLessons] = useState(null);
    const [avgCreditPoint, setAvgCreditPoint] = useState(null);
    const [lessonStatusBreakdown, setLessonStatusBreakdown] = useState([]);
    const [totalClassrooms, setTotalClassrooms] = useState(null);
    const [avgStudentsPerClassroom, setAvgStudentsPerClassroom] = useState(null);
    const [classroomStatusBreakdown, setClassroomStatusBreakdown] = useState([]);
    const [totalStudents,  setTotalStudents] = useState(null);
    const [studentPieData, setStudentPieData] = useState([]);
    const [totalInstructors, setTotalInstructors] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const STATUS_COLORS = {
        "Published": "#27ae60",
        "Draft": "#f39c12",
        "Archived": "#95a5a6",
        "Null": "#bdc3c7",
        "Completed": "#27ae60",
        "Ongoing": "#3498db",
        "Upcoming": "#f39c12",
        "Not Enrolled": "#f39c12",
    };
    const ALL_STATUSES = ["Published", "Draft", "Archived"];

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
                    throw new Error("Some course reports could not be retrieved.");
                }
                setTotalCourses(totalRes.data.data.count);
                setAvgLessons(avgRes.data.data.avg_lessons_per_course);
                setStatusBreakdown(
                    ALL_STATUSES.map(status => {
                        const found = breakdownRes.data.data.find(item => item.status === status);
                        return {
                            name: status,
                            value: found ? Number(found.course_count) : 0
                        };
                    })
                );
            } catch (err) {
                console.error("Error fetching course reports:", err);
                setError("Failed to load course reports.");
            } finally {
                setLoading(false);
            }
        };
        const fetchLessonReports = async () => {
            try {
                const [totalRes, avgRes, breakdownRes] = await Promise.all([
                    api.get("/statistics/lessons/total"),
                    api.get("/statistics/lessons/average-cp"),
                    api.get("/statistics/lessons/status-breakdown"),
                ]);
                if (!totalRes.data.success || !avgRes.data.success || !breakdownRes.data.success) {
                    throw new Error("Some lesson reports could not be retrieved.");
                }
                setTotalLessons(Number(totalRes.data.data[0].count));
                setAvgCreditPoint(Number(avgRes.data.data[0].round));
                setLessonStatusBreakdown(
                    ALL_STATUSES.map(status => {
                        const found = breakdownRes.data.data.find(item => item.status === status);
                        return {
                            name: status,
                            value: found ? Number(found.lesson_count) : 0
                        };
                    })
                );
            } catch (err) {
                console.error("Error fetching lesson reports:", err);
                setError("Failed to load lesson reports.");
            }
        };
        const fetchClassroomReports = async () => {
            try {
                const [totalRes, breakdownRes, avgRes] = await Promise.all([
                    api.get("/classroomStatistics/total"),
                    api.get("/classroomStatistics/status-breakdown"),
                    api.get("/classroomStatistics/average-students"),
                ]);
                if (!totalRes.data.success || !avgRes.data.success || !breakdownRes.data.success) {
                    throw new Error("Some classroom reports could not be retrieved.");
                }
                setTotalClassrooms(totalRes.data.data);
                setAvgStudentsPerClassroom(avgRes.data.data);
                setClassroomStatusBreakdown([
                    { name: "Completed", value: breakdownRes.data.data.completed || 0 },
                    { name: "Ongoing", value: breakdownRes.data.data.ongoing || 0 },
                    { name: "Upcoming", value: breakdownRes.data.data.notStarted || 0 },
                ]);
            } catch (err) {
                console.error("Error fetching classroom reports:", err);
                setError("Failed to load classroom reports.");
            }
        }
        const fetchUserReports = async () => {
            try {
                const userStatsRes = await api.get("/userStatistics/users");
                if (!userStatsRes.data.success) {
                    throw new Error("Some user reports could not be retrieved.");
                }
                setStudentPieData([
                    { name: "Not Enrolled", value: userStatsRes.data.data.totalNotEnrolled || 0 },
                    { name: "Ongoing", value: userStatsRes.data.data.totalInOngoingCourse || 0 },
                    { name: "Completed", value: userStatsRes.data.data.totalCompletedAllCourses || 0 },
                ]);
                setTotalStudents(userStatsRes.data.data.totalStudents);
                setTotalInstructors(userStatsRes.data.data.totalInstructors || 0);
            } catch (err) {
                console.error("Error fetching user reports:", err);
                setError("Failed to load user reports.");
            }
        }
        fetchCourseReports();
        fetchLessonReports();
        fetchClassroomReports();
        fetchUserReports();
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
                    {/** Lesson Reports */}
                    <h1 className="reports-title">Lesson Reports</h1>
                    <h2 className="reports-subtitle">{user?.user_role}: {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}</h2>
                    <div className="reports-row">
                        <div className="reports-card">
                            <h3>Total Lessons</h3>
                            <p className="reports-number">{totalLessons ?? "N/A"}</p>
                        </div>
                        <div className="reports-card reports-pie">
                            <h3>Lesson by Status</h3>
                            {lessonStatusBreakdown.length === 0 ? (
                                <p>No lessons found.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={lessonStatusBreakdown}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {lessonStatusBreakdown.map((entry, index) => (
                                                <Cell
                                                    key={`cell-lesson-${index}`}
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
                            <h3>Average Credit Points per Lesson</h3>
                            <p className="reports-number">
                                {avgCreditPoint ? avgCreditPoint.toFixed(2) : "N/A"}
                            </p>
                        </div>
                    </div>
                    {/** Classroom Reports */}
                    <h1 className="reports-title">Classroom Reports</h1>
                    <h2 className="reports-subtitle">{user?.user_role}: {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}</h2>
                    <div className="reports-row">
                        <div className="reports-card">
                            <h3>Total Classrooms</h3>
                            <p className="reports-number">{totalClassrooms ?? "N/A"}</p>
                        </div>
                        <div className="reports-card reports-pie">
                            <h3>Classroom by Status</h3>
                            {classroomStatusBreakdown.length === 0 ? (
                                <p>No classrooms found.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={classroomStatusBreakdown}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {classroomStatusBreakdown.map((entry, index) => (
                                                <Cell
                                                    key={`cell-lesson-${index}`}
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
                            <h3>Average Students per Classroom</h3>
                            <p className="reports-number">
                                {avgStudentsPerClassroom ? avgStudentsPerClassroom.toFixed(2) : "N/A"}
                            </p>
                        </div>
                    </div>
                    {/** Student Reports */}
                    <h1 className="reports-title">Student Reports</h1>
                    <h2 className="reports-subtitle">{user?.user_role}: {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}</h2>
                    <div className="reports-row">
                        <div className="reports-card">
                            <h3>Total Students</h3>
                            <p className="reports-number">{totalStudents ?? "N/A"}</p>
                        </div>
                        <div className="reports-card reports-pie">
                            <h3>Enrollment Breakdown</h3>
                            {studentPieData.length === 0 ? (
                                <p>No enrollment data found.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={studentPieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {studentPieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-lesson-${index}`}
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
                    </div>
                    {user?.user_role === "admin" && (
                        <>
                            {/** Instructor Reports */}
                            <h1 className="reports-title">Instructor Reports</h1>
                            <h2 className="reports-subtitle">{user?.user_role}: {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}</h2>
                            <div className="reports-row">
                                <div className="reports-card">
                                    <h3>Total Instructors</h3>
                                    <p className="reports-number">{totalInstructors ?? "N/A"}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Reports;
