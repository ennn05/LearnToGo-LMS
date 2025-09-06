import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockCourseAPI } from "../data/mockCourses";
import "../styles/Courses.css";

function Courses() {
  const [activePage, setActivePage] = useState("courses");
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch courses from mock API
  const fetchCourses = async () => {
    try {
      console.log("Fetching courses from mock API...");
      const data = await mockCourseAPI.getAllCourses();
      console.log("Courses loaded:", data);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // For testing: create a mock user if no user is logged in
      setUser({
        inst_fname: "Test",
        inst_lname: "User",
        inst_email: "test@example.com"
      });
    }
    fetchCourses();
  }, []);

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="profile">
          <div className="avatar"></div>
          <div className="info">
            <div className="name">
              {user ? `${user.inst_fname} ${user.inst_lname}` : "Loading..."}
            </div>
            <div className="role">Instructor</div>
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
        <div className="topbar">
          <h1>My Courses</h1>
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
                  key={course.course_id}
                  className="course-card"
                  onClick={() => handleCourseClick(course.course_id)}
                >
                  <div className="course-code">{course.course_code}</div>
                  <div className="course-title">{course.course_title}</div>
                  <div className="course-credits">{course.total_credits} credits</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Course Button */}
        <button className="fab" onClick={() => console.log("Add course clicked")}>
          +
        </button>
      </div>
    </div>
  );
}

export default Courses;
