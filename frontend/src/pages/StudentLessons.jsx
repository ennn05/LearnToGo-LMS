import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Lessons.css";
import useStore from "../store";
import useThemeStore from "../store/themeStore.js";

function StudentLessons() {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user, signOut } = useStore((state) => state);

             // 🌙 get theme + toggle function
  const { theme, toggleTheme } = useThemeStore();
  // 🌓 Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);


    /** Fetch lessons for enrolled courses */
    const fetchLessons = async () => {
        try {
            const { data: res } = await api.get("lessons");
            if (!res.success) {
                setError(res.message || "Failed to fetch lessons");
                setLessons([]);
            } else {
                console.log("Lessons fetched:", res.data);
                setLessons(res.data);
            }
        } catch (err) {
            setError("Error fetching student lessons");
            setLessons([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, []);

    const handleLogout = () => {
        signOut();
        navigate("/login");
    }

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
                        <div className="role">{user ? user.user_role : "Student"}</div>
                    </div>
                </div>
                {/* Navigation */}
                <nav className="nav-menu">
                    <button onClick={() => navigate("/courses")}>Courses</button>
                    <button className="active" onClick={() => navigate("/lessons")}>Lessons</button>
                    <button onClick={() => navigate("/classrooms")}>Classrooms</button>
                    <button className="logout-btn" onClick={handleLogout}>
                        Log Out
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="topbar">
                    <h1>My Lessons</h1>
                          <div className="theme-toggle">
                    <label className="switch">
                    <input
                        type="checkbox"
                        checked={theme === "dark"}
                        onChange={toggleTheme}
                    />
                    <span className="slider"></span>
                    </label>
                    <span className="theme-label">{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
                </div>
                </div>

                {/* Lessons List */}
                <div className="lessons-container">
                    {loading ? (
                        <div className="loading">Loading lessons...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : lessons.length === 0 ? (
                        <div className="no-lessons">
                            <p>No lessons found for your enrolled courses.</p>
                        </div>
                    ) : (
                        <div className="lessons-grid">
                            {lessons.map((lesson) => (
                                <div
                                    className="lesson-card"
                                    key={lesson.lesson_id}
                                    onClick={() => navigate(`/lessons/${lesson.lesson_id}`)}
                                >
                                    {/* Title */}
                                    <div className="lesson-header">
                                        <h3>{lesson.lesson_title}</h3>
                                    </div>
                                    {/* Details */}
                                    <div className="lesson-details">
                                        <p>
                                            <span className="label">ID:</span> {lesson.lesson_id}
                                        </p>
                                        <p>
                                            <span className="label">Status:</span> {lesson.lesson_status || "Draft"}
                                        </p>
                                        <p>
                                            <span className="label">Lesson credit:</span> {lesson.lesson_credit || 0} points
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentLessons;