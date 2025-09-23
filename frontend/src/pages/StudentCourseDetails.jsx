import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/CourseDetails.css";
import useStore from "../store";

function StudentCourseDetails() {
  const {user, setCredentials, signOut} = useStore((state) => state);
  console.log("User from store:", user);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const { data: response } = await api.get(`courses/${courseId}`);
        setCourse(response.data);
        setEnrolled(!!response.data?.enrolled);
      } catch (err) {
        setError("Course not found");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [courseId]);

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

  const handleLogout = () => {
    localStorage.removeItem("user");
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
        </div>
        
        <div className="course-details-container">
            {success && <span style={{ display: "block", color: "#27ae60", textAlign: "center", padding: "0 12px" }}>Enrolled successfully!</span>}
          {/* Enroll Button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 24 }}>

            {enrolled ? (
              <button style={{width: "fit-content"}} className="btn-edit" disabled>Enrolled</button>
            ) : (
              <button style={{width: "fit-content"}} className="btn-edit" onClick={handleEnroll} disabled={enrolling}>
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
            <div className="lessons-container">
              {course.lessons?.length === 0 || !course.lessons ? (
                <p className="no-lessons">No lessons assigned yet.</p>
              ) : (
                <div className="lessons-grid">
                  {course.lessons.map((lesson) => (
                    <div key={lesson.lesson_id} className="lesson-card">
                      <h4 className="lesson-title">{lesson.lesson_title}</h4>
                      <div className="lesson-credits">{lesson.lesson_credit ?? 0} credits</div>
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