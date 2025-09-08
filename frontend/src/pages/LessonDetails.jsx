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
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [DeleteConfirm, setDeleteConfirm] = useState(false);
  const [preReqModal, setShowPreReqModal] = useState(false);
  const [readingModal, setShowReadingModal] = useState(false);
  const [assignmentModal, setShowAssignmentModal] = useState(false);

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
      // console.log("Lesson date", data.data.lesson_date_created);
      // console.log(data.data.lesson_prereq.split("\n"));
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

  const editLesson = async (lessonData) => {
    try {
      const updateLessonData = {...lesson, ...lessonData};
      console.log(updateLessonData);
      const {data: res} = await api.put(`lessons/${lessonId}`, updateLessonData);
      console.log(res);
      if (!res.success) {
        console.error("Server responded with:", res.message);
        throw new Error("Failed to edit lesson");
      }

      console.log("Lesson updated:", res.data);
      await fetchLessonDetails();
      return res.data;
    } catch (error) {
      console.error("Error editing lesson:", error);
      alert("Failed to edit lesson. Please try again.");
    }
  };


  // --- NEW: Update status ---
  const handlePublishLesson = async () => {
    
    console.log("Publish lesson clicked");
    const updatedLesson = { ...lesson, lesson_status: 'published'};
    console.log(updatedLesson);

    const res = await fetch(`http://localhost:5000/api/lessons/${lessonId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedLesson),
    });

    if (!res.ok)
    {
      console.error("Error fetching lessons:", res);
    }
    const data = await res.json();

    console.log("Lesson published:", data.data);
    setLesson(data.data);
  };

  const handleArchiveLesson = async () => {
    try {
      const updatedLesson = { ...lesson, lesson_status: "archived" };
      const res = await fetch(`http://localhost:5000/api/lessons/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedLesson),
      });

      if (!res.ok) throw new Error("Failed to archive lesson");

      const data = await res.json();
      setLesson(data.data);
    } catch (err) {
      console.error("Error archiving lesson:", err);
    }
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
        </div>

        <div className="lesson-details-container">
          {/* Status + Actions (SAME LAYOUT as CourseDetails) */}
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
              {lesson.lesson_prereq?.length > 0 ? (
                lesson.lesson_prereq.trim().split("\n").map((item, idx) => (
                  <div key={idx} className="list-item">
                    {item}
                  </div>
                ))
              ) : (
                <p className="no-items">No pre-requisites yet.</p>
              )}
            </div>
            <button className="btn-add" onClick={() => setShowPreReqModal(true)}>+ Add Pre-Requisites</button>
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
            <button className="btn-add" onClick={() => setShowReadingModal(true)}>+ Add Reading</button>
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
            <button className="btn-add" onClick={() => setShowAssignmentModal(true)}>+ Add Assignment</button>
          </div>

          {/* Footer */}
          <div className="course-footer">
            <button className="btn-edit" onClick={() => setShowModal(true)}>
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

      {/* Pre-Requisites Modal */}
      {preReqModal && (
        <div className="modal-overlay" onClick={() => setShowPreReqModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add a Pre-requisite</h3>
            <form onSubmit={async (e) => {
                e.preventDefault();

                const preReqData = {
                  lesson_prereq: e.target.prereqItem.value.trim(),
                };

                console.log("Adding pre-requisite");
                // TODO: Send readingData to backend
                const result = await editLesson(preReqData);
                console.log("Pre-requisite added:", preReqData);
                alert("Pre-requisite added!");
                setShowPreReqModal(false);
            }}>
              <div className="form-group">
                <label>Add a pre-requisite: </label>
                {/* <input type="text" name="prereqItem" required /> */}
                <textarea name="prereqItem" rows="6" defaultValue={lesson.lesson_prereq}/>
              </div>
              <div className="modal-actions">
                <button type="submit">Add to Pre-requisites</button>
                <button className="cancel" onClick={() => setShowPreReqModal(false)}>Cancel</button>
              </div>
            </form>
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
                // TODO: Send readingData to backend
                const result = await editLesson(readingData);
                console.log("Reading added:", readingData);
                alert("Reading added!");
                setShowReadingModal(false);
            }}>
              <div className="form-group">
                <label>Add a reading item: </label>
                {/* <input type="text" name="readingItem" defaultValue={lesson.lesson_reading_list} /> */}
                <textarea name="readingItem" rows="6" defaultValue={lesson.lesson_reading_list}/>
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
                // TODO: Send readingData to backend
                const result = await editLesson(assignmentData);
                console.log("Assignment added:", assignmentData);
                alert("Assignment added!");
                setShowAssignmentModal(false);
            }}>
              <div className="form-group">
                <label>Add an assignment: </label>
                {/* <input type="text" name="item" required /> */}
                <textarea name="asgItem" rows="6" defaultValue={lesson.lesson_assignment}/>
              </div>
              <div className="modal-actions">
                <button type="submit">Add Assignment</button>
                <button className="cancel" onClick={() => setShowAssignmentModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
       
      {/* Edit Modal */}
       {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Lesson</h3>
            <form onSubmit={async (e) => {
                e.preventDefault();

                const lessonData = {
                  lesson_title: e.target.title.value,
                  lesson_desc: e.target.description.value,
                  lesson_obj: e.target.objective.value,
                  lesson_effort_per_week: e.target.estimatedTime.value,
                  lesson_credit: e.target.lessonCredit.value,
                };

                console.log("Editing lesson")
                // TODO: Send lessonData to backend
                const result = await editLesson(lessonData);
                

                console.log("Lesson edited:", lessonData);
                alert("Lesson change appended!");

                setShowModal(false);
              }}
          > 
              <div className="form-group">
                <label>Lesson Title</label>
                <input type="text" name="title" required defaultValue={lesson.lesson_title}/>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows="2" required defaultValue={lesson.lesson_desc}/>
              </div>

              <div className="form-group">
                <label>Objective</label>
                <textarea name="objective" rows="2" required defaultValue={lesson.lesson_obj}/>
              </div>

              <div className="form-group-inline">
                <label>Estimated Time (hours per week)</label>
                <input
                  type="number"
                  name="estimatedTime"
                  placeholder="e.g. 30"
                  required
                  defaultValue={lesson.lesson_effort_per_week ? lesson.lesson_effort_per_week : 0}
                />
              </div>

              <div className="form-group-inline">
                <label>Lesson Credit (points)</label>
                <input
                  type="number"
                  name="lessonCredit"
                  placeholder="e.g. 6"
                  required
                  defaultValue={lesson.lesson_credit ? lesson.lesson_credit : 0}
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

export default LessonDetails;

