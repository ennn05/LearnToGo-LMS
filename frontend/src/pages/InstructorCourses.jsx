import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import useStore from "../store";
import { mockCourseAPI } from "../data/mockCourses";
import "../styles/Courses.css";

function InstructorCourses() {
  const [activePage, setActivePage] = useState("courses");
  const {user, setCredentials, signOut} = useStore((state) => state);
  console.log("User from store:", user);
  // const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch courses from mock API
  const fetchCourses = async () => {
    try {
      console.log("Fetching courses from mock API...");
      // const data = await mockCourseAPI.getAllCourses();
      const {data: res} = await api.get("courses/instructor");
      // const response = await fetch("http://localhost:5000/api/courses/instructor");

      if (!res.success)
      {
        console.error("Error fetching courses:", res.message);
      }
      // const data = await response.json();

      console.log("Courses loaded:", res.data);
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // const storedUser = localStorage.getItem("user");
    // console.log(storedUser);
    // if (storedUser) {
    //   setUser(JSON.parse(storedUser));
    //   console.log("User: ", user);
    // } 
    setLoading(true);
    fetchCourses();
  }, []);

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    signOut();
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
              {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}
            </div>
            <div className="role">{user ? user.user_role : "Loading..."}</div>
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
                  key={course.course_code}
                  className="course-card"
                  onClick={() => handleCourseClick(course.course_code)}
                >
                  <div className="course-code">{course.course_code}</div>
                  <div className="course-title">{course.course_title}</div>
                  <div className="course-credits">{course.course_total_credit} credits</div>
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

export default InstructorCourses;