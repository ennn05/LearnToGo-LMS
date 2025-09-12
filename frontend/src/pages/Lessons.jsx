import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Lessons.css";

function Lessons() {
  // Page state
  const [activePage, setActivePage] = useState("lessons");
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /** Fetch lessons from API */
  const fetchLessons = async () => {
    try {
      const { data: res } = await api.get("lessons/");
      console.log(res);

      if (!res.success) {
        console.error("Server responded with:", res.message);
        throw new Error("Failed to fetch lessons");
      }

      setLessons(res.data);
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  /** On mount: load user + fetch lessons */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchLessons();
  }, []);

  /** Add new lesson */
  const addLesson = async (lessonData) => {
    try {
      const createLessonData = {
        ...lessonData,
        lesson_designer: user.user_id, // Attach instructor ID
      };

      const { data: res } = await api.post("lessons", createLessonData);
      if (!res.success) {
        console.error("Server responded with:", res.message);
        throw new Error("Failed to add lesson");
      }

      console.log("Lesson saved:", res.data);
      await fetchLessons(); // Refresh lessons list
      return res.data;
    } catch (error) {
      console.error("Error adding lesson:", error);
      alert("Failed to add lesson. Please try again.");
    }
  };

  /** Logout clears user + navigates home */
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
              {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}
            </div>
            <div className="role">{user ? user.user_role : "Instructor"}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-menu">
          <button
            className={activePage === "courses" ? "active" : ""}
            onClick={() => navigate("/courses")}
          >
            Courses
          </button>
          <button
            className={activePage === "lessons" ? "active" : ""}
            onClick={() => setActivePage("lessons")}
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
          <h1>My Lessons</h1>
        </div>

        {/* Lessons List */}
        <div className="lessons-container">
          {loading ? (
            <div className="loading">Loading lessons...</div>
          ) : lessons.length === 0 ? (
            <div className="no-lessons">
              <p>No lessons found. Create your first lesson!</p>
            </div>
          ) : (
            <div className="lessons-grid">
              {lessons.map((lesson) => (
                <div
                  className="lesson-card"
                  key={lesson.lesson_id}
                  onClick={() => navigate(`/lessons/${lesson.lesson_id}`)}
                >
                  {/* Title */}
                  <div className="lesson-header">
                    <h3>{lesson.lesson_title}</h3>
                  </div>

                  {/* Details */}
                  <div className="lesson-details">
                    <p>
                      <span className="label">ID:</span> {lesson.lesson_id}
                    </p>
                    <p>
                      <span className="label">Status:</span>{" "}
                      {lesson.lesson_status || "Draft"}
                    </p>
                    <p>
                      <span className="label">Created by:</span>{" "}
                      {lesson.lesson_designer || "Unknown"}
                    </p>
                    <p>
                      <span className="label">Lesson credit:</span>{" "}
                      {lesson.lesson_credit || 0} points
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Lesson Button (FAB) */}
        <button className="fab" onClick={() => setShowModal(true)}>
          +
        </button>

        {/* Add Lesson Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Add Lesson</h3>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  const lessonData = {
                    lesson_title: e.target.title.value,
                    lesson_desc: e.target.description.value,
                    lesson_obj: e.target.objective.value,
                    lesson_effort_per_week: e.target.estimatedTime.value,
                    lesson_credit: e.target.lessonCredit.value,
                  };

                  const result = await addLesson(lessonData);
                  console.log("Lesson submitted:", lessonData, result);

                  alert("Lesson added!");
                  setShowModal(false);
                }}
              >
                <div className="form-group">
                  <label>Lesson Title</label>
                  <input type="text" name="title" required />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" rows="2" required />
                </div>

                <div className="form-group">
                  <label>Objective</label>
                  <textarea name="objective" rows="2" required />
                </div>

                <div className="form-group-inline">
                  <label>Estimated Time (hours per week)</label>
                  <input
                    type="number"
                    name="estimatedTime"
                    placeholder="e.g. 30"
                    required
                  />
                </div>

                <div className="form-group-inline">
                  <label>Lesson Credit (points)</label>
                  <input
                    type="number"
                    name="lessonCredit"
                    placeholder="e.g. 6"
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit">Save</button>
                  <button
                    type="button"
                    className="cancel"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Lessons;
