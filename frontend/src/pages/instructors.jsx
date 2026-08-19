import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/instructors.css";
import useStore from "../store";
import useThemeStore from "../store/themeStore.js";

const Instructors = () => {
  // Track active sidebar page
  const [activePage] = useState("instructors");

  // Current logged-in user
  const { user, signOut } = useStore((state) => state);

  // List of instructors loaded from API
  const [instructors, setInstructors] = useState([]);

  // Loading state while fetching instructors
  const [loading, setLoading] = useState(true);

  // Feedback messages (success/error)
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // 🌙 get theme + toggle function
  const { theme, toggleTheme } = useThemeStore();
  // 🌓 Apply theme to document root
  useEffect(() => {
  document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /**
   * Fetch all instructors from the backend API
   */
  const fetchInstructors = async () => {
    try {

      const response = await fetch("http://localhost:5000/api/instructors");
      const data = await response.json();

      setInstructors(data.data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstructors = instructors.filter((i) => {
    const fullName = `${i.user_fname} ${i.user_lname}`.toLowerCase();
    const email = i.user_email.toLowerCase();
    const term = searchTerm.toLowerCase();

    return fullName.includes(term) || email.includes(term);
  });

  /**
   * On mount:
   * - Check role & redirect if not admin
   * - Fetch instructors list
   */
  useEffect(() => {
    if (!user || user.user_role !== "admin") {
      navigate("/"); // redirect non-admins back to home
      return;
    }

    fetchInstructors();
  }, [user, navigate]);

  /**
   * Handle logout: clear localStorage & redirect
   */
  const handleLogout = () => {
    localStorage.removeItem("user");
    signOut();
    navigate("/");
  };

  /**
   * Remove an instructor by ID (DELETE API call)
   */
  const handleRemove = async (instUserId) => {
    if (window.confirm("Are you sure you want to remove this instructor?")) {
      const prevInstructors = [...instructors]; // backup

      try {

        const res = await fetch(
          `http://localhost:5000/api/instructors/${instUserId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText);
        }

        setMessage({ text: "Instructor removed successfully!", type: "success" });
        setTimeout(() => setMessage(null), 3000);

        // Optimistically update UI
        setInstructors(instructors.filter((i) => i.user_id !== instUserId));
      } catch (error) {
        console.error("Error deleting instructor:", error.message);

        setMessage({
          text: "Failed to remove instructor. Please try again.",
          type: "error",
        });
        setTimeout(() => setMessage(null), 3000);

        // Rollback if delete fails
        setInstructors(prevInstructors);
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
            <button
            className={activePage === "instructors" ? "active" : ""}
            onClick={() => navigate("/instructors")}
          >
            Instructors
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {message && (
          <div className={`feedback ${message.type}`}>{message.text}</div>
        )}

        <div className="topbar">
          <h1>Instructors</h1>
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

        <div className="instructors-container">
          {loading ? (
            <div className="loading">Loading instructors...</div>
          ) : instructors.length === 0 ? (
            <div className="no-instructors">
              <p>No instructors found.</p>
            </div>
          ) : (
            <table className="instructors-table">
              <thead>
                <tr>
                  <th>Instructor Name</th>
                  <th>Instructor Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredInstructors.map((i) => (
                  <tr key={i.user_id}>
                    <td>{`${i.user_fname} ${i.user_lname}`}</td>
                    <td>{i.user_email}</td>
                    <td className="action">
                      <button onClick={() => handleRemove(i.user_id)}>
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

export default Instructors;
