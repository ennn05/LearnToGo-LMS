import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import { mockCourseAPI } from "../data/mockCourses"; // Mock API for testing if needed
import "../styles/Courses.css";

function Courses() {
  // Track active sidebar page
  const [activePage, setActivePage] = useState("courses");

  // Current logged-in user
  const [user, setUser] = useState(null);

  // Instructor's courses list
  const [courses, setCourses] = useState([]);

  // Loading state for courses
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /**
   * Fetch courses from API (mock or backend)
   */
  const fetchCourses = async () => {
    try {
      console.log("Fetching courses from API...");

      // Example with mock:
      // const data = await mockCourseAPI.getAllCourses();

      const { data: res } = await api.get("courses"); // Fetch all courses instead of Instructor's courses only

      if (!res.success) {
        console.error("Error fetching courses:", res.message);
      }

      console.log("Courses loaded:", res.data);
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * On mount:
   * - Load user info from localStorage
   * - Fetch courses
   */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Stored user:", storedUser);

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      console.log("User set:", user);
    }

    fetchCourses();
  }, []);

  /**
   * Navigate to a specific course details page
   */
  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  /**
   * Handle logout: clear localStorage & redirect
   */
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
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
            <div className="role">
              {user ? user.user_role : "Loading..."}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <button
            className={activePage === "courses" ? "active" : ""}
            onClick={() => setActivePage("courses")}
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

      {/* Main Content */}
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <h1>All Courses</h1>
        </div>

        {/* Courses Grid */}
        <div className="courses-container">
          {loading ? (
            <div className="loading">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="no-courses">
              <p>No courses found. Create your first course!</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => (
                <div
                  key={course.course_code}
                  className="course-card"
                  onClick={() => handleCourseClick(course.course_code)}
                >
                  <div className="course-code">{course.course_code}</div>
                  <div className="course-title">{course.course_title}</div>
                  <div className="course-credits">
                    {course.course_total_credit} credits
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Course Button */}
        <button className="fab" onClick={() => navigate("/courses/create")}>
          +
        </button>
      </div>
    </div>
  );
}

export default Courses;
