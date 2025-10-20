import React, { useEffect, useState } from "react";
import { useParams, useNavigate , useLocation } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/CourseDetails.css";
import useStore from "../store";
import useThemeStore from "../store/themeStore.js";

function StudentCourseDetails() {
  const {user, setCredentials, signOut} = useStore((state) => state);
  console.log("User from store:", user);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromMyCourses = location.state?.fromMyCourses || false;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [success, setSuccess] = useState(false);
     // 🌙 get theme + toggle function
  const { theme, toggleTheme } = useThemeStore();
  // 🌓 Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const [unenrolling, setUnenrolling] = useState(false);
  const [unEnrollSuccess, setUnEnrollSuccess] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const { data: response } = await api.get(`courses/${courseId}`);
        console.log("pogg");
        console.log(response.data);
        setCourse(response.data);
        setEnrolled(fromMyCourses);
      } catch (err) {
        setError("Course not found");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [courseId, fromMyCourses]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const {data: res} = await api.post(`courses/${courseId}/enroll`);
      if (res?.success) {
        setEnrolled(true);
        setSuccess(true);
        console.log("Enrolled successfully", res);
      } else {
        setError(res?.message || "Enrollment failed");
      }
    } catch (err) {
      setError("Failed to enroll. Try again later.");
    } finally {
      setEnrolling(false);
    }
  };
  
  const handleUnenroll = async () => {
    const confirmUnenroll = window.confirm("Are you sure you want to unenroll from this course?");
    if (!confirmUnenroll) return;
    try {
      setUnenrolling(true);
      setUnEnrollSuccess(false);
      const { data: res } = await api.delete(`courses/${courseId}/enroll`);
      if (!res.success) {
        throw new Error(res.message || "Failed to unenroll");
      }
      setEnrolled(false);
      setUnEnrollSuccess(true);
      console.log("Unenrolled successfully:", res.message || res);
    } catch (error) {
      console.error("Error during unenrollment:", error);
      alert("Failed to unenroll. Please try again.");
    } finally {
      setUnenrolling(false);
      setTimeout(() => setUnEnrollSuccess(false), 3000);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex">
        <div className="sidebar">
          <div className="profile">
            <div className="avatar"></div>
            <div className="info">
              <div className="name">{user.user_fname} {user.user_lname}</div>
              <div className="role">{user.user_role || "Student"}</div>
            </div>
          </div>
          <nav className="nav-menu">
            <button className="active" onClick={() => navigate("/courses")}>Courses</button>
            <button onClick={() => navigate("/lessons")}>Lessons</button>
            <button onClick={() => navigate("/classrooms")}>Classrooms</button>
            <button className="logout-btn" onClick={handleLogout}>Log Out</button>
          </nav>
        </div>
        <div className="main-content">
          <div className="loading">Loading course details...</div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex">
        <div className="sidebar">
          <div className="profile">
            <div className="avatar"></div>
            <div className="info">
              <div className="name">{user.user_fname} {user.user_lname}</div>
              <div className="role">{user.user_role || "Student"}</div>
            </div>
          </div>
          <nav className="nav-menu">
            <button className="active" onClick={() => navigate("/courses")}>Courses</button>
            <button onClick={() => navigate("/lessons")}>Lessons</button>
            <button onClick={() => navigate("/classrooms")}>Classrooms</button>
            <button className="logout-btn" onClick={handleLogout}>Log Out</button>
          </nav>
        </div>
        <div className="main-content">
          <div className="error">
            <h2>Error</h2>
            <p>{error || "Course not found"}</p>
            <button onClick={() => navigate("/courses")}>Back to Courses</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="profile">
          <div className="avatar"></div>
          <div className="info">
            <div className="name">{user.user_fname} {user.user_lname}</div>
            <div className="role">{user.user_role || "Student"}</div>
          </div>
        </div>
        <nav className="nav-menu">
          <button className="active" onClick={() => navigate("/courses")}>Courses</button>
          <button onClick={() => navigate("/lessons")}>Lessons</button>
          <button onClick={() => navigate("/classrooms")}>Classrooms</button>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </nav>
      </div>
      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <h1>Course Details</h1>
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
        
        <div className="course-details-container">

      {/* === Header Row (Progress + Button) === */}
      <div className="course-header-row">
        {enrolled ? (
          <div className="progress-container">
            <span className="progress-label">Progress</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${course.completion_rate ?? 0}%` }}
              ></div>
            </div>
            <span className="progress-percent">{course.completion_rate ?? 0}%</span>
          </div>
        ) : (
          <div className="progress-placeholder"></div> // keeps layout consistent
        )}
        
        {fromMyCourses ? (
          <button
            style={{
              width: "fit-content",
              backgroundColor: "#e74c3c",
              opacity: unenrolling || !enrolled ? 0.6 : 1,
              cursor: unenrolling || !enrolled ? "not-allowed" : "pointer",
            }}
            className="btn-edit"
            onClick={handleUnenroll}
            disabled={unenrolling || !enrolled}
          >
            {unenrolling ? "Un-enrolling..." : "Un-enroll"}
          </button>
        ) : (
          <button
            style={{
              width: "fit-content",
              opacity: enrolling || enrolled ? 0.6 : 1,
              cursor: enrolling || enrolled ? "not-allowed" : "pointer",
            }}
            className="btn-edit"
            onClick={handleEnroll}
            disabled={enrolling || enrolled}
          >
            {enrolling ? "Enrolling..." : "Enroll"}
          </button>
        )}
      </div>
          {/* Course Information */}
          <div className="course-info">
            <div className="info-item">
              <label>Course code:</label>
              <span>{course.course_code}</span>
            </div>
            <div className="info-item">
              <label>Course title:</label>
              <span>{course.course_title}</span>
            </div>
            <div className="info-item">
              <label>Total credit:</label>
              <span>{course.course_total_credit}</span>
            </div>
            <div className="info-item">
              <label>Created by:</label>
              <span>{course.user_fname} {course.user_lname}</span>
            </div>
          </div>
          {/* Lessons Assigned */}
          <div className="lessons-section">
            <h3>Lessons Assigned</h3>
            <div className="course-lessons-container">
              {course.lessons?.length === 0 || !course.lessons ? (
                <p className="no-lessons">No lessons assigned yet.</p>
              ) : (
                <div className="course-lessons-grid">
                  {course.lessons.map((lesson) => (
                    <div key={lesson.lesson_id} className="course-lesson-card">
                      <h4 className="course-lesson-title">{lesson.lesson_title}</h4>
                      <div className="course-lesson-credits">{lesson.lesson_credit ?? 0} credits</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentCourseDetails;