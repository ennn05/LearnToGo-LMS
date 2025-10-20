import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../libs/apiCalls"; 
import useStore from "../store";
import "../styles/LessonDetails.css";
import useThemeStore from "../store/themeStore.js";

function InstructorLessonDetails() {
  const { lessonId } = useParams();
  const [activePage, setActivePage] = useState(null);
  const navigate = useNavigate();

  const {user, signOut} = useStore((state) => state);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [DeleteConfirm, setDeleteConfirm] = useState(false);

  // NEW STATES
  const [lessonPrereqs, setLessonPrereqs] = useState([]); 
  const [allLessons, setAllLessons] = useState([]);

  // 🌙 get theme + toggle function
  const { theme, toggleTheme } = useThemeStore();

  // Fetch lesson details
  const fetchLessonDetails = async () => {
    try {
      const {data: res} = await api.get(`lessons/${lessonId}`);
      if (!res.success) {
        console.error("Error fetching courses:", res.message);
      }
      
      setLesson(res.data);

      // If prereqs already exist (comma or newline separated text), parse into array
      if (res.data.lesson_prereq) {
        const parsed = res.data.lesson_prereq
          .split("\n")
          .map((s) => s.trim())
          .map((title, idx) => ({ lesson_id: idx, lesson_title: title }));
        setLessonPrereqs(parsed);
      }
    } catch (err) {
      console.error("Error fetching lesson:", err);
      setError("Lesson not found");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all lessons to pick prereqs from
  const fetchAllLessons = async () => {
    try {
      const {data: res} = await api.get("lessons");
      
      setAllLessons(res.data || []);
    } catch (err) {
      console.error("Error fetching all lessons:", err);
    }
  };

    // 🌓 Apply theme to document root
    useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

  useEffect(() => {
    // const storedUser = localStorage.getItem("user");
    // if (storedUser) {
    //   setUser(JSON.parse(storedUser));
    // }
    fetchLessonDetails();
    fetchAllLessons();
  }, [lessonId]);

  // --- keep your other handlers (publish, archive, delete, editLesson, etc.)


  // Navigate back to the lessons page
  const handleBackToLessons = () => navigate("/lessons");

  // Log the user out and navigate to the login page
  const handleLogout = () => {
    localStorage.removeItem("user");
    signOut();
    navigate("/");
  };


  // Update the lesson status to 'published'
  const handlePublishLesson = async () => {
    console.log("Publish lesson clicked");
    const updatedLesson = { ...lesson, lesson_status: 'published'};
    console.log(updatedLesson);

    const {data: res} = await api.put(`lessons/${lessonId}`, updatedLesson);

    if (!res.success)
    {
      console.error("Error fetching lessons:", res.message);
    }
    console.log("Lesson published:", res.data);
    fetchLessonDetails();
  };

  // Update the lesson status to 'archived'
  const handleArchiveLesson = async () => {
    try {
      const updatedLesson = { ...lesson, lesson_status: "archived" };
      const {data: res} = await api.put(`lessons/${lessonId}`, updatedLesson);

      if (!res.success) throw new Error("Failed to archive lesson");

      fetchLessonDetails();
    } catch (err) {
      console.error("Error archiving lesson:", err);
    }
    
  };
  
  // Delete the lesson from the API and navigate to the lessons page
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

  // If the component is still loading, display a "Loading lesson..."
  // message. This prevents the component from attempting to render
  // a lesson that hasn't been fetched yet.
  if (loading) {
    return <div className="loading">Loading lesson...</div>;
  }

  
  // If there is an error or the lesson is not found, 
  // display an error message with a "Back to Lessons" button
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

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <button onClick={() => navigate("/courses")}>Courses</button>
          <button onClick={() => navigate("/lessons")} className="active">
            Lessons
          </button>
          <button onClick={() => navigate("/classrooms")}>Classrooms</button>
          <button onClick={() => navigate("/students")}>Students</button>
          <button onClick={() => navigate("/reports")}>
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
          <h1>Lesson Details</h1>
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

        {/* Lesson Details */}
        <div className="lesson-details-container">
          <div className="lesson-header">
            <div className="lesson-status">
              <span
                className={`status-badge ${lesson.lesson_status || "draft"}`}
              >
                {lesson.lesson_status || "Draft"}
              </span>
            </div>
            <div className="lesson-actions">
              {lesson.lesson_status !== "published" && (
                <button className="btn-publish" onClick={handlePublishLesson}>
                  Publish
                </button>
              )}
              {lesson.lesson_status !== "archived" && (
                <button className="btn-archive" onClick={handleArchiveLesson}>
                  Archive
                </button>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="lesson-meta">
            <h2>{lesson.lesson_title || "Untitled Lesson"}</h2>
            <p>
              <strong>ID:</strong> {lesson.lesson_id || "NULL"}
            </p>
            <p>
              <strong>By:</strong> {lesson.user_fname && lesson.user_lname ? `${lesson.user_fname} ${lesson.user_lname}` : "Unknown"}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(lesson.lesson_date_created).toLocaleDateString() ||
                "NULL"}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {new Date(lesson.lesson_date_updated).toLocaleDateString() ||
                "NULL"}
            </p>
          </div>

          {/* Content */}
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
              <p>{lesson.lesson_effort_per_week ?? 0} hours per week</p>
            </div>
            <div className="info-item">
              <label>Lesson Credit:</label>
              <p>{lesson.lesson_credit ?? 0} credit points</p>
            </div>
          </div>
          
          {/* Pre-Requisites */}
          <div className="list-section">
            <h3>Pre-Requisites</h3>
            <div className="scroll-list">
              {lessonPrereqs.length > 0 ? (
                lessonPrereqs.map((p) => (
                  <div key={p.lesson_id} className="list-item">
                    {p.lesson_title}
                  </div>
                ))
              ) : (
                <p className="no-items">No pre-requisites yet.</p>
              )}
            </div>
          </div>

          {/* Reading List */}
          <div className="list-section">
            <h3>Reading List</h3>
            <div className="scroll-list">
              {lesson.lesson_reading_list?.length > 0 ? (
                lesson.lesson_reading_list.trim().split("\n").map((item, idx) => (
                  <div key={idx} className="list-item">
                    {item}
                  </div>
                ))
                // <div className="list-item">
                //     {lesson.lesson_reading_list}
                //   </div>
              ) : (
                <p className="no-items">No reading materials yet.</p>
              )}
            </div>
          </div>

          {/* Assignments */}
          <div className="list-section">
            <h3>Assignments</h3>
            <div className="scroll-list">
              {lesson.lesson_assignment?.length > 0 ? (
                lesson.lesson_assignment.trim().split("\n").map((item, idx) => (
                  <div key={idx} className="list-item">
                    {item}
                  </div>
                ))
              ) : (
                <p className="no-items">No assignments yet.</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="course-footer">
            <button className="btn-edit" onClick={() => navigate(`/lessons/${lessonId}/edit`)}>
              Edit
            </button>
            <button
              className="btn-delete"
              onClick={() => setDeleteConfirm(true)}
            >
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
              <button
                onClick={() => {
                  setDeleteConfirm(false);
                  handleDeleteLesson();
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

export default InstructorLessonDetails;

