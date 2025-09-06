import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockCourseAPI } from "../data/mockCourses";
import "../styles/CourseDetails.css";

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch course details from mock API
  const fetchCourseDetails = async () => {
    try {
      // const data = await mockCourseAPI.getCourseById(courseId);
      // const data = await api.get(`courses/instructor/${courseId}`);
      const res = await fetch(`http://localhost:5000/api/courses/instructor/${courseId}`);
      if (!res.ok)
      {
        console.error("Error fetching courses:", res);
      }
      const data = await res.json();

      console.log("Course details loaded:", data.data);
      setCourse(data.data);
    } catch (error) {
      console.error("Error fetching course details:", error);
      setError("Course not found");
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
        user_fname: "Test",
        user_lname: "User",
        user_email: "test@example.com",
        user_role: "Instructor",
      });
    }
    fetchCourseDetails();
  }, [courseId]);

  const handleBackToCourses = () => {
    navigate("/courses");
  };

  const handleEditCourse = () => {
    // TODO: Implement edit course functionality
    console.log("Edit course clicked");
  };

  const handlePublishCourse = () => {
    // TODO: Implement publish course functionality
    console.log("Publish course clicked");
  };

  const handleArchiveCourse = () => {
    // TODO: Implement archive course functionality
    console.log("Archive course clicked");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex">
        <div className="sidebar">
          <div className="profile">
            <div className="avatar"></div>
            <div className="info">
              <div className="name">Loading...</div>
              <div className="role">Instructor</div>
            </div>
          </div>
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
              <div className="name">{user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}</div>
              <div className="role">{user.user_role}</div>
            </div>
          </div>
        </div>
        <div className="main-content">
          <div className="error">
            <h2>Error</h2>
            <p>{error || "Course not found"}</p>
            <button onClick={handleBackToCourses}>Back to Courses</button>
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
            <div className="name">
              {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}
            </div>
            <div className="role">{user.user_role}</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <button
            className="active"
            onClick={handleBackToCourses}
          >
            Courses
          </button>
          <button onClick={() => navigate("/lessons")}>
            Lessons
          </button>
          <button onClick={() => console.log("Classrooms clicked")}>
            Classrooms
          </button>
          <button onClick={() => console.log("Students clicked")}>
            Students
          </button>
          <button onClick={() => console.log("Reports clicked")}>
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
          <h1>Course Details</h1>
        </div>

        <div className="course-details-container">
          {/* Course Status and Actions */}
          <div className="course-header">
            <div className="course-status">
              <span className={`status-badge ${course.course_status || 'draft'}`}>
                {course.course_status || 'Draft'}
              </span>
            </div>
            <div className="course-actions">
              <button className="btn-publish" onClick={handlePublishCourse}>
                Publish
              </button>
              <button className="btn-archive" onClick={handleArchiveCourse}>
                Archive
              </button>
            </div>
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
              <label>Date created:</label>
              <span>{new Date(course.course_date_created).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Last updated:</label>
              <span>{new Date(course.course_date_updated).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Created by:</label>
              <span>{user ? `${course.user_fname} ${course.user_lname}` : "Unknown"}</span>
            </div>
          </div>

          {/* Lessons Assigned Section */}
          <div className="lessons-section">
            <h3>Lessons Assigned</h3>
            <div className="lessons-container">
              <p className="no-lessons">No lessons assigned yet.</p>
            </div>
          </div>

          {/* Edit Button */}
          <div className="course-footer">
            <button className="btn-edit" onClick={handleEditCourse}>
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
