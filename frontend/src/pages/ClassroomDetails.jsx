import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import { mockStudents } from "../data/mockStudents";  // ✅ import mock students
import "../styles/CourseDetails.css";

function ClassroomDetails() {
  const { classroomId } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]); // ✅ state for students
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const { data: res } = await api.get(`classrooms/${classroomId}`);
        if (!res.success) {
          console.error("Error fetching classroom:", res.message);
          setError("Classroom not found");
          return;
        }
        setClassroom(res.data);

        // ✅ Mock students for now
        setStudents(mockStudents);
      } catch (error) {
        console.error("Error fetching classroom:", error);
        setError("Classroom not found");
      } finally {
        setLoading(false);
      }
    };

    fetchClassroom();
  }, [classroomId]);

  if (loading) {
    return (
      <div className="flex">
        <div className="main-content">
          <div className="loading">Loading classroom details...</div>
        </div>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="flex">
        <div className="main-content">
          <div className="error">
            <h2>Error</h2>
            <p>{error || "Classroom not found"}</p>
            <button onClick={() => navigate("/classrooms")}>Back to Classrooms</button>
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
              {classroom?.instructor_name || "Instructor"}
            </div>
            <div className="role">
              Instructor
            </div>
          </div>
        </div>
        <nav className="nav-menu">
          <button onClick={() => navigate("/courses")}>Courses</button>
          <button onClick={() => navigate("/lessons")}>Lessons</button>
          <button onClick={() => navigate("/classrooms")}>Classrooms</button>
          <button onClick={() => navigate("/students")}>Students</button>
          <button onClick={() => navigate("/reports")}>Reports & Statistics</button>
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem("user");
            navigate("/");
          }}>
            Log Out
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <h1>Classroom Details</h1>
        </div>

        <div className="course-details-container">
          {/* Classroom Status */}
          <div className="course-header">
            <div className="course-status">
              <span className={`status-badge ${classroom.status || "draft"}`}>
                {classroom.status || "Draft"}
              </span>
            </div>
          </div>

          {/* Classroom Info */}
          <div className="course-info">
            <div className="info-item">
              <label>Classroom ID:</label>
              <span>{classroom.cr_id}</span>
            </div>
            <div className="info-item">
              <label>Start Date:</label>
              <span>{new Date(classroom.cr_start_date).toLocaleDateString() || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Duration:</label>
              <span>{classroom.cr_duration || "N/A"} week(s)</span>
            </div>
            <div className="info-item">
              <label>Created By:</label>
              <span>{classroom.cr_creator || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Supervisor:</label>
              <span>{classroom.supervisor_id}</span>
            </div>
            <div className="info-item">
              <label>Course:</label>
              <span>{classroom.course_title || classroom.course_code}</span>
            </div>
          </div>

        {/* Lessons Section */}
        <div className="lessons-section">
          <h3>Lessons</h3>
          <div className="lessons-container">
            {classroom.lessons?.length === 0 ? (
              <p className="no-lessons">No lessons assigned yet.</p>
            ) : (
              <div className="lessons-grid">
                {classroom.lessons.map((lesson) => (
                  <div key={lesson.lesson_id} className="lesson-card">
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

          {/* ✅ Students Section */}
          <div className="students-section">
            <h3>Students</h3>
            <div className="lessons-container">
              {students.length === 0 ? (
                <p className="no-lessons">No students enrolled yet.</p>
              ) : (
                <div className="lessons-grid">
                  {students.map((stu) => (
                    <div key={stu.stu_user_id} className="lesson-card">
                      <h4 className="lesson-title">{stu.stu_name}</h4>
                      <div className="lesson-credits">{stu.stu_email}</div>
                      <div className="lesson-credits">Grade: {stu.stu_grade}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="course-footer">
            <button className="btn-edit" onClick={() => console.log("Edit classroom")}>
              Edit
            </button>
            <button className="btn-delete" onClick={() => console.log("Delete classroom")}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClassroomDetails;
