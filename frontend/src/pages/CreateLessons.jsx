import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateLessons.css";
import api from "../libs/apiCalls"; 

function CreateLesson() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("lessons")

  // Lesson form state
  const [lessonData, setLessonData] = useState({
    lesson_title: "",
    lesson_desc: "",
    lesson_obj: "",
    lesson_effort_per_week: "",
    lesson_credit: "",
    lesson_status: "draft",
    lesson_reading_list: [],
    lesson_assignment: [],
    lesson_prereq: []
  });

  // For managing prerequisites
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [preReqModal, setShowPreReqModal] = useState(false);
  const [lessonPrereqs, setLessonPrereqs] = useState([]); 
  const [allLessons, setAllLessons] = useState([]);

  const [readingModal, setShowReadingModal] = useState(false);
  const [assignmentModal, setShowAssignmentModal] = useState(false);

  // Load user + published lessons for prerequisites
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    fetchAllLessons();
  }, []);

  // Fetch all lessons to pick prereqs from
  const fetchAllLessons = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/lessons");
      const data = await res.json();
      setAllLessons(data.data || []);
    } catch (err) {
      console.error("Error fetching all lessons:", err);
    }
  };

  // Handle input change for lesson details
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLessonData((prev) => ({ ...prev, [name]: value }));
  };


  // Add prerequisite (local only)
  const handleAddPrereq = (lessonObj) => {
    if (!lessonPrereqs.some((p) => p.lesson_id === lessonObj.lesson_id)) {
      setLessonPrereqs([...lessonPrereqs, lessonObj]);
      setLessonData((prev) => ({ ...prev, lesson_prereq: [...prev.lesson_prereq, lessonObj] }));
    }
  };

  // Remove prerequisite
  const handleRemovePrereq = (id) => {
    setLessonPrereqs(lessonPrereqs.filter((p) => p.lesson_id !== id));
    setLessonData((prev) => ({
      ...prev,
      lesson_prereq: prev.lesson_prereq.filter((p) => p.lesson_id !== id),
    }));
  };

  // Save lesson (draft or publish)
  const handleSave = async (status) => {
    try {
      const payload = {
        ...lessonData,
        lesson_status: status,
        lesson_designer: user?.user_id ?? 1, // fallback mock id
      };

      const response = await fetch("http://localhost:5000/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log(response);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to save lesson");
      }

      alert(`Lesson ${status === "published" ? "published" : "saved"} successfully!`);
      navigate("/lessons");
    } catch (err) {
      console.error("Error saving lesson:", err);
      alert("Error saving lesson. Try again.");
    }
  };
  
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
            <div className="role">{user?.user_role ?? "Instructor"}</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <button
            className={activePage === "courses" ? "active" : ""}
            onClick={() => navigate("/courses")}
          >
            Courses
          </button>
          <button
            className={activePage === "lessons" ? "active" : ""}
            onClick={() => navigate("/lessons")}
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
            onClick={() => setActivePage("reports")}
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
          <h1>New Course</h1>
        </div>
        <div className="create-lesson-container">
          <h1>Create Lesson</h1>

          {/* Lesson Details */}
          <div className="lesson-form">
            <input
              type="text"
              name="lesson_title"
              placeholder="Lesson Title"
              value={lessonData.lesson_title}
              onChange={handleChange}
            />
            <textarea
              name="lesson_desc"
              placeholder="Lesson Description"
              value={lessonData.lesson_desc}
              onChange={handleChange}
            />
            <textarea
              name="lesson_obj"
              placeholder="Learning Objectives"
              value={lessonData.lesson_obj}
              onChange={handleChange}
            />
            <input
              type="number"
              name="lesson_effort_per_week"
              placeholder="Effort per week (hrs)"
              value={lessonData.lesson_effort_per_week}
              onChange={handleChange}
            />
            <input
              type="number"
              name="lesson_credit"
              placeholder="Credits"
              value={lessonData.lesson_credit}
              onChange={handleChange}
            />
          </div>

          {/* Pre-Requisites */}
          <div className="list-section">
            <h3>Pre-Requisites</h3>
            <div className="scroll-list">
              {lessonData.lesson_prereq.length > 0 ? (
                lessonData.lesson_prereq.map((p) => (
                  <div key={p.lesson_id} className="list-item">
                    {p.lesson_title}
                    <button onClick={() => handleRemovePrereq(p.lesson_id)}>x</button>
                  </div>
                ))
              ) : (
                <p className="no-items">No pre-requisites yet.</p>
              )}
            </div>
            <button className="btn-add" onClick={() => setShowPreReqModal(true)}>
              + Add Pre-Requisites
            </button>
          </div>

          {/* Reading List */}
          <div className="list-section">
            <h3>Reading List</h3>
            <div className="scroll-list">
              {lessonData.lesson_reading_list?.length > 0 ? (
                lessonData.lesson_reading_list.trim().split("\n").map((item, idx) => (
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
            <button className="btn-add" onClick={() => setShowReadingModal(true)}>+ Add Reading</button>
          </div>

          {/* Assignments */}
          <div className="list-section">
            <h3>Assignments</h3>
            <div className="scroll-list">
              {lessonData.lesson_assignment?.length > 0 ? (
                lessonData.lesson_assignment.trim().split("\n").map((item, idx) => (
                  <div key={idx} className="list-item">
                    {item}
                  </div>
                ))
              ) : (
                <p className="no-items">No assignments yet.</p>
              )}
            </div>
            <button className="btn-add" onClick={() => setShowAssignmentModal(true)}>+ Add Assignment</button>
          </div>

          {/* Actions */}
          <div className="actions">
            <button onClick={() => handleSave("draft")}>Save as Draft</button>
            <button onClick={() => handleSave("published")}>Publish</button>
            <button onClick={() => navigate("/lessons")}>Cancel</button>
          </div>
        </div>
      </div>
    {/* Pre-Requisites Modal */}
    {preReqModal && (
      <div className="modal-overlay" onClick={() => setShowPreReqModal(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h3>Select Prerequisites</h3>

          {/* List published lessons */}
          <div className="lesson-list">
            {allLessons
              .filter(
                (l) =>
                  l.lesson_status === "published" &&
                  l.lesson_id !== lessonData.lesson_id
              )
              .map((l) => (
                <div key={l.lesson_id} className="list-item">
                  <span>{l.lesson_title}</span>
                  <button onClick={() => handleAddPrereq(l)}>+</button>
                </div>
              ))}
          </div>

          {/* Show currently selected prereqs */}
          <div className="selected-prereqs">
            <h4>Selected:</h4>
            {lessonPrereqs.length > 0 ? (
              lessonPrereqs.map((p) => (
                <div key={p.lesson_id} className="selected-item">
                  {p.lesson_title}
                </div>
              ))
            ) : (
              <p>No prerequisites selected yet.</p>
            )}
          </div>

          <div className="modal-actions">
            <button
              onClick={() => {
                setShowPreReqModal(false);
              }}
            >
              Save
            </button>
            <button className="cancel" onClick={() => setShowPreReqModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

      {/* Reading List Modal */}
      {readingModal && (
        <div className="modal-overlay" onClick={() => setShowReadingModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Reading</h3>
            <form onSubmit={async (e) => {
                e.preventDefault();

                const readingData = {
                  lesson_reading_list: e.target.readingItem.value.trim(),
                };

                console.log("Adding reading")
                setLessonData((prev) => ({ ...prev, ...readingData }));
                console.log("Reading added:", readingData);
                alert("Reading added!");
                setShowReadingModal(false);
            }}>
              <div className="form-group">
                <label>Add a reading item: </label>
                {/* <input type="text" name="readingItem" defaultValue={lesson.lesson_reading_list} /> */}
                <textarea name="readingItem" rows="6" defaultValue={lessonData.lesson_reading_list}/>
              </div>
              <div className="modal-actions">
                <button type="submit">Add Reading</button>
                <button className="cancel" onClick={() => setShowReadingModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {assignmentModal && (
        <div className="modal-overlay" onClick={() => setShowAssignmentModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Assignment</h3>
            <form onSubmit={async (e) => {
                e.preventDefault();

                const assignmentData = {
                  lesson_assignment: e.target.asgItem.value.trim(),
                };

                console.log("Adding assignment")
                setLessonData((prev) => ({ ...prev, ...assignmentData }));
                console.log("Assignment added:", assignmentData);
                alert("Assignment added!");
                setShowAssignmentModal(false);
            }}>
              <div className="form-group">
                <label>Add an assignment: </label>
                {/* <input type="text" name="item" required /> */}
                <textarea name="asgItem" rows="6" defaultValue={lessonData.lesson_assignment}/>
              </div>
              <div className="modal-actions">
                <button type="submit">Add Assignment</button>
                <button className="cancel" onClick={() => setShowAssignmentModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateLesson;
