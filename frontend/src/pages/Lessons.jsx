import { useState, useEffect } from "react";
import "../styles/Lessons.css";

function Lessons() {
  const [activePage, setActivePage] = useState("lessons");
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/lessons");
        const data = await response.json();
        setLessons(data);
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
      }
    };
    fetchLessons();
  }, []);

  const addLesson = async (lessonData) => {
    try {
      const response = await fetch("http://localhost:5000/api/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) {
        const errorText = await response.text(); // <-- capture backend response
        console.error("Server responded with:", errorText);
        throw new Error("Failed to add lesson");
      }

      const result = await response.json();
      console.log("Lesson saved:", result);
      return result;
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

  return (
    <div className="flex">

      <div className="lessons-list">
        {lessons.map((lesson) => (
          <div className="lesson-card" key={lesson.lesson_id}>
            <div className="lesson-info">
              <h3>{lesson.lesson_title}</h3>
              <p>{lesson.lesson_desc}</p>
              <p>Objective: {lesson.lesson_obj}</p>
              <p>Effort per week: {lesson.lesson_effort_per_week} days</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="profile">
          <div className="avatar"></div>
          <div className="info">
          <div className="name">{user? `${user.inst_fname} ${user.inst_lname}`: "Loading..."}</div>
          <div className="role">Instructor</div>
        </div>
      </div>

      {/* Lessons Button*/}
      <button className={activePage === "lessons" ? "active" : ""}
        onClick={() => setActivePage("lessons")}
      > Lessons
      </button>

      {/* Courses Button*/}
      <button
        className={activePage === "courses" ? "active" : ""}
        onClick={() => setActivePage("courses")}
      > Courses
      </button>

    </div>
      {/* Main Content */}
      <div className="main-content">

        {/* Lessons Topbar */}
        {activePage === "lessons" && (
          <div>
            <div className="topbar">Lessons</div>
          </div>
        )}
        
        {/* Courses Topbar */}
        {activePage === "courses" && (
          <div>
            <div className="topbar">Courses</div>
          </div>
        )}

        {/* Add Lesson Button */}
        <button className="fab" onClick={() => setShowModal(true)}> + </button>

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

                  // TODO: Send lessonData to backend
                  const result = await addLesson(lessonData);
                  

                  console.log("Lesson submitted:", lessonData);
                  alert("Lesson added! (Hook this to backend)");

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
