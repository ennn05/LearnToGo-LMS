import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../libs/apiCalls"; 
import "../styles/LessonDetails.css";

function LessonDetails() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [DeleteConfirm, setDeleteConfirm] = useState(false);

  // Fetch lesson details
  const fetchLessonDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/lessons/${lessonId}`);
      if (!res.ok)
      {
        console.error("Error fetching courses:", res);
      }
      const data = await res.json();
      console.log("Lesson details:", data.data);
      console.log("Lesson date", data.data.date_created);
      setLesson(data.data);
    } catch (err) {
      console.error("Error fetching lesson:", err);
      setError("Lesson not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchLessonDetails();
  }, [lessonId]);

  const handleBackToLessons = () => navigate("/lessons");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleDeleteLesson = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/lessons/${lessonId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Failed to delete lesson.");
        return;
      }
      navigate("/lessons");
    } catch (error) {
      alert("Error deleting lesson.");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading">Loading lesson...</div>;
  }

  if (error || !lesson) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error || "Lesson not found"}</p>
        <button onClick={handleBackToLessons}>Back to Lessons</button>
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
            <div className="role">{user?.user_role || "Instructor"}</div>
          </div>
        </div>

        <nav className="nav-menu">
          <button onClick={() => navigate("/courses")}>Courses</button>
          <button onClick={() => navigate("/lessons")} className="active">
            Lessons
          </button>
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
          <h1>Lesson Details</h1>
        </div>

        <div className="lesson-details-container">
          {/* Top Section (metadata) */}
          <div className="lesson-header">
            <h2>{lesson.lesson_title || "NULL"}</h2>
            <div className="lesson-meta">
              <p><strong>ID:</strong> {lesson.lesson_id || "NULL"}</p>
              <p><strong>By:</strong> {lesson.user_fname} {lesson.user_lname}</p>
              <p><strong>Created:</strong> {new Date(lesson.lesson_date_created).toLocaleDateString() || "NULL"}</p>
              <p><strong>Last Updated:</strong> {new Date(lesson.lesson_date_updated).toLocaleDateString() || "NULL"}</p>
            </div>
          </div>

          {/* Bottom Section (content) */}
          <div className="lesson-content">
            <div className="info-item">
              <label>Description:</label>
              <p>{lesson.lesson_desc}</p>
            </div>
            <div className="info-item">
              <label>Objective:</label>
              <p>{lesson.lesson_obj}</p>
            </div>
            <div className="info-item">
              <label>Estimated Time:</label>
              <p>{lesson.lesson_estimated_time?? 0} days</p>
            </div>
          </div>

          {/* Reading List */}
          <div className="list-section">
            <h3>Reading List</h3>
            <div className="scroll-list">
              {lesson.reading_list?.length > 0 ? (
                lesson.reading_list.map((item, idx) => (
                  <div key={idx} className="list-item">{item}</div>
                ))
              ) : (
                <p className="no-items">No reading materials yet.</p>
              )}
            </div>
            <button className="btn-add">+ Add Reading</button>
          </div>

          {/* Assignments */}
          <div className="list-section">
            <h3>Assignments</h3>
            <div className="scroll-list">
              {lesson.assignments?.length > 0 ? (
                lesson.assignments.map((item, idx) => (
                  <div key={idx} className="list-item">{item}</div>
                ))
              ) : (
                <p className="no-items">No assignments yet.</p>
              )}
            </div>
            <button className="btn-add">+ Add Assignment</button>
          </div>

          {/* Action Buttons */}
          <div className="course-footer">
            <button className="btn-edit">
              Edit
            </button>
            <button className="btn-delete" onClick={() => setDeleteConfirm(true)}>
              Delete
            </button>
          </div>
        </div>
      </div>
      
      {/* Delete Lesson Confirmation */}
      {DeleteConfirm && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal">
            <h3>Are you sure you want to delete this lesson?</h3>
            <div className="delete-confirmation-actions">
              <button onClick={() => { setDeleteConfirm(false); handleDeleteLesson(); }} className="btn-delete">Delete</button>
              <button onClick={() => setDeleteConfirm(false)} className="delete-confirmation-btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LessonDetails;
