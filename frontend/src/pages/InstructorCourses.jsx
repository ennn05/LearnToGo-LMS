import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import { mockCourseAPI } from "../data/mockCourses"; // Mock API for testing if needed
import "../styles/Courses.css";

function InstructorCourses() {
  // Track active sidebar page
  const [activePage, setActivePage] = useState("courses");

  // Current logged-in user
  const [user, setUser] = useState(null);

  // Instructor's courses list
  const [courses, setCourses] = useState([]);

  // Loading state for courses
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // e.g., all, created by me, created by others
  // const [filteredCourses, setFilteredCourses] = useState([]);
  const navigate = useNavigate();

  /**
   * Fetch courses from API (mock or backend)
   */
  const fetchCourses = async () => {
    try {
      console.log("Fetching courses from API...");

      // Example with mock:
      // const data = await mockCourseAPI.getAllCourses();

      const { data: res } = await api.get("courses/instructor");

      if (!res.success) {
        console.error("Error fetching courses:", res.message);
      }

      console.log("Courses loaded:", res.data);
      setCourses(res.data);
      setFilter("all");
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

  // useEffect(() => {
  //   setFilteredCourses(
  //     filter === "all"
  //       ? courses
  //       : filter === "mine"
  //       ? courses.filter((course) => course.course_creator === user?.user_id)
  //       : courses.filter((course) => course.course_creator !== user?.user_id)
  //   );
  // }, [filter]);

  const filteredCourses = courses.filter((course) => {
      if (filter === "mine") {
        return course.course_creator === user?.user_id; 
      } else if (filter === "others") {
        return course.course_creator !== user?.user_id; 
      }
      return true; // "all"
    });

    console.log(filteredCourses);

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
          <h1>My Courses</h1>
        </div>

        {/* Courses Grid */}
        <div className="courses-container">
          <div className="filter-dropdown">
            <label htmlFor="courseFilter">Filter by Creator: </label>
            <select
              id="courseFilter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Courses</option>
              <option value="mine">Created by Me</option>
              <option value="others">Created by Others</option>
            </select>
          </div>
          {loading ? (
            <div className="loading">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="no-courses">
              <p>No courses found. Create your first course!</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course) => {
                // Fallback to "default" if no status is set
                const statusClass = course.course_status?.toLowerCase() || "default";

                return (
                  <div
                    key={course.course_code}
                    className="course-card"
                    onClick={() => handleCourseClick(course.course_code)}
                  >
                    {/* Colored top section */}
                    <div className={`course-top-section ${statusClass}`}>
                      {course.course_code}
                    </div>

                    {/* Card body */}
                    <div className="course-body">
                      <div className="course-title">{course.course_title}</div>
                      <div className="course-credits">
                        {course.course_total_credit} credits
                      </div>
                    </div>
                  </div>
                );
              })}
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