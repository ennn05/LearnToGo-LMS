// import api from "../libs/apiCalls"; // Uncomment if switching from fetch to centralized api wrapper
import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/students.css";

const Students = () => {
  // Track active sidebar page
  const [activePage, setActivePage] = useState("students");

  // Current logged-in user
  const [user, setUser] = useState(null);

  // List of students loaded from API
  const [students, setStudents] = useState([]);

  // Loading state while fetching students
  const [loading, setLoading] = useState(true);

  // Feedback messages (success/error)
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  /**
   * Fetch all students from the backend API
   */
  const fetchStudents = async () => {
    try {
      console.log("Fetching students from API...");

      // Example if using central api helper:
      // const { data: res } = await api.get("students");
      // setStudents(res?.data);

      const response = await fetch("http://localhost:5000/api/students");
      console.log(response);

      const data = await response.json();
      console.log("Students loaded: ", data.data);

      setStudents(data.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * On mount:
   * - Load user info from localStorage
   * - Fetch students list
   */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Stored user:", storedUser);

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchStudents();
  }, []);

  /**
   * Handle logout: clear localStorage & redirect
   */
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  /**
   * Remove a student by ID (DELETE API call)
   */
  const handleRemove = async (stuUserId) => {
    if (window.confirm("Are you sure you want to remove this student?")) {
      const prevStudents = [...students]; // Keep backup before deleting

      try {
        console.log("Deleting student from API...");

        // Example with central api helper:
        // const res = await api.delete(`/students/${stuUserId}`);

        const res = await fetch(
          `http://localhost:5000/api/students/${stuUserId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText);
        }

        const data = await res.json();
        console.log("Deleted:", data.data);

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
            onClick={() => setActivePage("classrooms")}
          >
            Classrooms
          </button>
          <button
            className={activePage === "students" ? "active" : ""}
            onClick={() => setActivePage("students")}
          >
            Students
          </button>
          <button
            className={activePage === "reports" ? "active" : ""}
            onClick={() => setActivePage("reports")}
          >
            Reports & Statistics
          </button>
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

        {/* Topbar */}
        <div className="topbar">
          <h1>Students</h1>
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
                {students.map((s) => (
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
