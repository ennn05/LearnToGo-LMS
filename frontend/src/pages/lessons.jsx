import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
// import useStore from "../store";
import "../styles/Lessons.css";

function Lessons() {
  const [activePage, setActivePage] = useState("lessons");
  // const user = useStore((state) => state);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchLessons = async () => {
    try {
      // const response = await fetch(`http://localhost:5000/api/lessons/instructor/${user.user_id}`);
      const {data: res} = await api.get("lessons/instructor");
      console.log(res);
      if (!res.success) {
        console.error("Server responded with:", res.message);
        throw new Error("Failed to edit lesson");
      }

      // const data = await response.json();
      console.log(res.data);
      setLessons(res.data);
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // const fetchLessons = async () => {
    //   try {
        
    //     // const response = await fetch("http://localhost:5000/api/lessons");
    //     // const data = await response.json();
    //     // setLessons(data);

    //     const {data: res} = await api.get("/lessons");
    //     setLessons(res);
    //   } catch (err) {
    //     console.error("Failed to fetch lessons:", err);
    //   }
    // };
    const storedUser = localStorage.getItem("user");
    console.log(storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      console.log(user);
    }
    fetchLessons();
  }, []);

    const addLesson = async (lessonData) => {
    try {
      const createLessonData = {
        ...lessonData,
        lesson_designer: user.user_id,
      }
      const {data: res} = await api.post("lessons", createLessonData);
      console.log(res)
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

  // useEffect(() => {
  //   const storedUser = localStorage.getItem("user");
  //   if (storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  // }, []);

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
                  <div
                    className={`lesson-top-section ${
                      lesson.lesson_status?.toLowerCase() || "draft"
                    }`}
                  >
                    <h3>{lesson.lesson_title}</h3>
                  </div>

                  <div className="lesson-body">
                    <div className="lesson-detail">
                      <strong>ID:</strong> {lesson.lesson_id}
                    </div>
                    <div className="lesson-detail">
                      <strong>Status:</strong> {lesson.lesson_status || "Draft"}
                    </div>
                    <div className="lesson-detail">
                      <strong>Created by:</strong>{" "}
                      {lesson.lesson_designer || "Unknown"}
                    </div>
                    <div className="lesson-detail">
                      <strong>Lesson Credit:</strong>{" "}
                      {lesson.lesson_credit || 0} points
                    </div>
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
                    lesson_title: e.target.title.value,
                    lesson_desc: e.target.description.value,
                    lesson_obj: e.target.objective.value,
                    lesson_effort_per_week: e.target.estimatedTime.value,
                    lesson_credit: e.target.lessonCredit.value,
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
