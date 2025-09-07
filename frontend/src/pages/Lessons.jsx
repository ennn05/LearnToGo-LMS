import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Lessons.css";

function Lessons() {
  const [activePage, setActivePage] = useState("lessons");
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const { data: res } = await api.get("/lessons");
        setLessons(res);
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

    const addLesson = async (lessonData) => {
    try {
      const {data: res} = await api.post("lessons", lessonData);

      if (!res.success) {
        console.error("Server responded with:", res.message);
        throw new Error("Failed to add lesson");
      }

      console.log("Lesson saved:", res.data);
      await fetchLessons();
      return res.data;
    } catch (error) {
      console.error("Error adding lesson:", error);
      alert("Failed to add lesson. Please try again.");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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

        {/* Lessons Container */}
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
                <div className="lesson-card" key={lesson.lesson_id}>
                  
                  {/* Section 1: Title + ID */}
                  <div className="lesson-section">
                    <p><span className="label">Title:</span> {lesson.lesson_title}</p>
                    <p><span className="label">ID:</span> {lesson.lesson_id}</p>
                  </div>

                  {/* Section 2: Status + Created by */}
                  <div className="lesson-section">
                    <p><span className="label">Status:</span> {lesson.status || "Draft"}</p>
                    <p><span className="label">Created by:</span> {lesson.created_by || "Unknown"}</p>
                  </div>

                  {/* Section 3: Classroom + Students */}
                  <div className="lesson-section">
                    <p><span className="label">Classroom:</span> {lesson.classroom || "Not assigned"}</p>
                    <p><span className="label">Students:</span> {lesson.students_count || 0}</p>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>


        {/* Add Lesson Button */}
        <button className="fab" onClick={() => setShowModal(true)}>
          +
        </button>

         {/* Modal */}
         {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Add Lesson</h3>
              <form onSubmit={async (e) => {
                  e.preventDefault();

                  const lessonData = {
                    title: e.target.title.value,
                    description: e.target.description.value,
                    objective: e.target.objective.value,
                    estimatedTime: e.target.estimatedTime.value,
                  };

                  console.log("Adding lesson")
                  // TODO: Send lessonData to backend
                  const result = await addLesson(lessonData);
                  

                  console.log("Lesson submitted:", lessonData);
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
                  <label>Estimated Time (days)</label>
                  <input
                    type="text"
                    name="estimatedTime"
                    placeholder="e.g. 30"
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
