import React from "react";
import useStore from "../store";
import { Navigate } from "react-router-dom";
import InstructorCourses from "./InstructorCourses";
import StudentCourses from "./StudentCourses";
function Courses() {
    const {user} = useStore((state) => state);
    switch (user?.user_role) {
        case "student":
            return <StudentCourses />;
        case "instructor":
        case "admin":
            return <InstructorCourses />;
        default:
            return <Navigate to="/login" />;
    }
<<<<<<< HEAD
=======
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
              {courses.map((course) => {
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
>>>>>>> origin/feat/scrum-93-intructor-can-view-courses,lessons,classroom-with-colours
}

export default Courses;
