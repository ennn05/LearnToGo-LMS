import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { mockCourseAPI } from "../../../data/mockCourses";
import "../styles/CourseDetails.css";
import api from "../libs/apiCalls";
import useStore from "../store";

function InstructorCourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {user, signOut} = useStore((state) => state);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [DeleteConfirm, setDeleteConfirm] = useState(false);

  // Fetch course details from API
  const fetchCourseDetails = async () => {
    try {
      // TODO: Replace with api wrapper instead of fetch
      // const data = await mockCourseAPI.getCourseById(courseId);
      // const data = await api.get(`courses/instructor/${courseId}`);
      const {data: res} = await api.get(`courses/${courseId}`);
      if (!res.success) {
        console.error("Error fetching courses:", res.message);
      }

      console.log("Course details loaded:", res.data);
      console.log(res.data.lessons);
      setCourse(res.data);
    } catch (error) {
      console.error("Error fetching course details:", error);
      setError("Course not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load user from localStorage (fallback to mock user if none found)
    // const storedUser = localStorage.getItem("user");
    // if (storedUser) {
    //   setUser(JSON.parse(storedUser));
    // } else {
    //   // For testing: create a mock user if no user is logged in
    //   setUser({
    //     user_fname: "Test",
    //     user_lname: "User",
    //     user_email: "test@example.com",
    //     user_role: "Instructor",
    //   });
    // }
    fetchCourseDetails();
  }, [courseId]);

  const handleBackToCourses = () => {
    navigate("/courses");
  };

  const handleEditCourse = () => {
    // TODO: Implement edit course functionality
    console.log("Edit course clicked");
    navigate(`/courses/${courseId}/edit`);
  };

  const handlePublishCourse = async () => {
    // TODO: Implement publish course functionality
    console.log("Publish course clicked");
    console.log(course);
    const courseUpdateData = { ...course, lessons: undefined, course_status: "published", course_date_updated: new Date().toLocaleDateString()};
    console.log(courseUpdateData);

    try {
      const {data: res} = await api.put(`courses/${courseId}`, courseUpdateData);

      if (!res.success) {
        console.error("Error publishing course:", res.message);
        alert('Failed publishing course.');
      }

      console.log("Course published:", res.data);
      fetchCourseDetails();
    } catch (error) {
      console.error("Error publishing course:", error);
    }
  };

  const handleArchiveCourse = async () => {
    // TODO: Implement archive course functionality
    console.log("Archive course clicked");

    const courseUpdateData = { ...course, lessons: undefined, course_status: "archived", course_date_updated: new Date().toLocaleDateString() };
    console.log(courseUpdateData);

    try {
      const {data: res} = await api.put(`courses/${courseId}`, courseUpdateData);

      if (!res.success) {
        console.error("Error archiving course:", res.message);
        alert('Failed archiving course.');
      }

      console.log("Course archived:", res.data);
      fetchCourseDetails();
    } catch (error) {
      console.error("Error archiving course:", error);
    }
  };

  const handleLessonClick = (lessonId) => {
    // Navigate to lesson details page
    navigate(`/lessons/${lessonId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    signOut();
    navigate("/");
  };

  const handleDeleteCourse = async () => {
    try {
      // Send DELETE request
      const {data: res} = await api.delete(`courses/${courseId}`);

      if (!res.success) {
        alert("Failed to delete course.");
        return;
      }
      else
      {
        alert("Deleted course successfully.");
      }

      navigate("/courses"); // Redirect back after deletion
    } catch (error) {
      alert("Error deleting course.");
      console.error(error);
    }
  };

  // Loading state
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

  // Error state
  if (error || !course) {
    return (
      <div className="flex">
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

  // Main course details UI
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
          <button className="active" onClick={handleBackToCourses}>
            Courses
          </button>
          <button onClick={() => navigate("/lessons")}>Lessons</button>
          <button onClick={() => navigate("/classrooms")}>Classrooms</button>
          <button onClick={() => navigate("/students")}>Students</button>
          <button onClick={() => navigate("/reports")}>Reports & Statistics</button>
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
              <span className={`status-badge ${course.course_status || "draft"}`}>
                {course.course_status || "Draft"}
              </span>
            </div>
            <div className="course-actions">
              {course.course_status !== "published" ? (
                <button className="btn-publish" onClick={handlePublishCourse}>
                  Publish
                </button>
              ) : (
                ""
              )}
              {course.course_status !== "archived" ? (
                <button className="btn-archive" onClick={handleArchiveCourse}>
                  Archive
                </button>
              ) : (
                ""
              )}
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
              {course.lessons?.length === 0 ? (
                <p className="no-lessons">No lessons assigned yet.</p>
              ) : (
                <div className="lessons-grid">
                  {course.lessons?.map((lesson) => (
                    <div
                      key={lesson.lesson_id}
                      className="lesson-card"
                      onClick={() => handleLessonClick(lesson.lesson_id)}
                    >
                      <h4 className="lesson-title">{lesson.lesson_title}</h4>
                      <div className="lesson-credits">
                        {lesson.lesson_credit ?? 0} credits
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Edit/Delete Buttons */}
          <div className="course-footer">
            <button className="btn-edit" onClick={handleEditCourse}>
              Edit
            </button>
            <button className="btn-delete" onClick={() => setDeleteConfirm(true)}>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Course Confirmation */}
      {DeleteConfirm && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal">
            <h3>Are you sure you want to delete this course?</h3>
            <div className="delete-confirmation-actions">
              <button
                onClick={() => {
                  setDeleteConfirm(false);
                  handleDeleteCourse();
                }}
                className="btn-delete"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="delete-confirmation-btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorCourseDetails;
