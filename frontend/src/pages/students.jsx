import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/students.css";
import useStore from "../store";
import useThemeStore from "../store/themeStore.js";
import api from "../libs/apiCalls.js";

const Students = () => {
  // Track active sidebar page
  const [activePage] = useState("students");

  // Current logged-in user
  const {user, signOut} = useStore((state) => state);

  // List of students loaded from API
  const [students, setStudents] = useState([]);

  // Loading state while fetching students
  const [loading, setLoading] = useState(true);

  // Feedback messages (success/error)
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // 🌙 get theme + toggle function
  const { theme, toggleTheme } = useThemeStore();

  /**
   * Fetch all students from the backend API
   */
  const fetchStudents = async () => {
    try {

      // Example if using central api helper:
      // const { data: res } = await api.get("students");
      // setStudents(res?.data);

      const {data: response} = await api.get("students");


      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🌓 Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const filteredStudents = students.filter((s) => {
  const fullName = `${s.user_fname} ${s.user_lname}`.toLowerCase();
  const email = s.user_email.toLowerCase();
  const term = searchTerm.toLowerCase();

    return fullName.includes(term) || email.includes(term);
  });

  /**
   * On mount:
   * - Load user info from localStorage
   * - Fetch students list
   */
  useEffect(() => {
    fetchStudents();
  }, []);

  /**
   * Handle logout: clear localStorage & redirect
   */
  const handleLogout = () => {
    localStorage.removeItem("user");
    signOut();
    navigate("/");
  };

  /**
   * Remove a student by ID (DELETE API call)
   */
  const handleRemove = async (stuUserId) => {
    if (window.confirm("Are you sure you want to remove this student?")) {
      const prevStudents = [...students]; // Keep backup before deleting

      try {

        // Example with central api helper:
        // const res = await api.delete(`/students/${stuUserId}`);

        const {data: res} = await api.delete(`students/${stuUserId}`);

        if (!res.success) {
          throw new Error(res.message);
        }


        // Show success feedback
        setMessage({ text: "Student removed successfully!", type: "success" });
        setTimeout(() => setMessage(null), 3000);

        // Optimistically update UI
        setStudents(students.filter((s) => s.user_id !== stuUserId));
      } catch (error) {
        console.error("Error deleting student:", error.message);

        // Show error feedback
        setMessage({
          text: "Failed to remove student. Please try again.",
          type: "error",
        });
        setTimeout(() => setMessage(null), 3000);

        // Rollback UI to previous state if needed
        setStudents(prevStudents);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Profile section */}
        <div className="profile">
          <div className="avatar"></div>
          <div className="info">
            <div className="name">
              {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}
            </div>
            <div className="role">{user ? user.user_role : ""}</div>
          </div>
        </div>

       {/* Navigation Menu */}
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
                  {user?.user_role === "admin" && (
            <button
              className={activePage === "instructors" ? "active" : ""}
              onClick={() => navigate("/instructors")}
            >
              Instructors
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Feedback banner */}
        {message && (
          <div className={`feedback ${message.type}`}>{message.text}</div>
        )}

        {/* Topbar with Theme Toggle */}
        <div className="topbar">
          <h1>Students</h1>
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

        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Students Table */}
        <div className="students-container">
          {loading ? (
            <div className="loading">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="no-students">
              <p>No students found.</p>
            </div>
          ) : (
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.user_id}>
                    <td>{`${s.user_fname} ${s.user_lname}`}</td>
                    <td>{s.user_email}</td>
                    <td className="action">
                      <button onClick={() => handleRemove(s.user_id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Students;
