import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import { mockStudents } from "../data/mockStudents";  // ✅ import mock students
import "../styles/CourseDetails.css";
import useStore from "../store";

function ClassroomDetails() {
  const { classroomId } = useParams();
  const { user, setCredentials, signOut } = useStore((state) => state);
  console.log("User from store:", user);
  // Classroom state
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchClassroom = async () => {
      try {
        const { data: res } = await api.get(`classrooms/${classroomId}`);
        if (!res.success) {
          console.error("Error fetching classroom:", res.message);
          setError("Classroom not found");
          return;
        }
        console.log("Classroom loaded:", res.data);
        setClassroom(res.data);

        // ✅ Mock students for now
      } catch (error) {
        console.error("Error fetching classroom:", error);
        setError("Classroom not found");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {

    fetchClassroom();
  }, [classroomId]);

  const handlePublishClassroom = async () => {
    // TODO: Implement publish classroom functionality
    console.log("Publish classroom clicked");

    const classroomUpdateData = { ...classroom, cr_status: "published" };
    console.log(classroomUpdateData);

    try {
      const {data: res} = await api.put(`classrooms/${classroom.cr_id}`, classroomUpdateData);

      if (!res.success) {
        console.error("Error publishing classroom:", res.message);
      }

      console.log("Classroom published:", res.data);
      fetchClassroom();
    } catch (error) {
      console.error("Error publishing classroom:", error);
    }
  };

  const handleArchiveClassroom = async () => {
    // TODO: Implement archive classroom functionality
    console.log("Archive classroom clicked");

    const classroomUpdateData = { ...classroom, cr_status: "archived" };
    console.log(classroomUpdateData);

    try {
      const {data: res} = await api.put(`classrooms/${classroom.cr_id}`, classroomUpdateData);

      if (!res.success) {
        console.error("Error archiving classroom:", res.message);
      }

      console.log("Classroom archived:", res.data);
      fetchClassroom();
    } catch (error) {
      console.error("Error archiving classroom:", error);
    }
  };


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
                {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}
            </div>
            <div className="role">
              {user ? user.user_role : "Loading..."}
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
            signOut();
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
              <span className={`status-badge ${classroom.cr_status.toLowerCase() || "draft"}`}>
                {classroom.cr_status || "Draft"}
              </span>
            </div>
            
            <div className="course-actions">
              {classroom.cr_status !== "published" ? (
                <button className="btn-publish" onClick={handlePublishClassroom}>
                  Publish
                </button>
              ) : (
                ""
              )}
              {classroom.cr_status !== "archived" ? (
                <button className="btn-archive" onClick={handleArchiveClassroom}>
                  Archive
                </button>
              ) : (
                ""
              )}
            </div>
          </div>

          {/* Classroom Info */}
          <div className="course-info">
            <div className="info-item">
              <label>Classroom ID:</label>
              <span>{classroom.cr_id}</span>
            </div>
            <div className="info-item">
              <label>Date created:</label>
              <span>{new Date(classroom.cr_date_created).toLocaleDateString() || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Start Date:</label>
              <span>{new Date(classroom.cr_start_date).toLocaleDateString() || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Last updated:</label>
              <span>{new Date(classroom.cr_last_updated).toLocaleDateString() || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Duration:</label>
              <span>{classroom.cr_duration || "N/A"} week(s)</span>
            </div>
            <div className="info-item">
              <label>Created By:</label>
              <span>{classroom.creator_fname + ' ' + classroom.creator_lname || "N/A"}</span>
            </div>
          </div>
        <div className="supervisor-course-section">
          <div className="form-row">
              <div className="form-group">
                  <label>Supervisor:</label>
                  <span>{classroom.supervisor_fname + ' ' + classroom.supervisor_lname || "N/A"}</span>
              </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Course:</label>
              <span>{classroom.course_code + ' - ' + classroom.course_title}</span>
            </div>
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
                  <div key={lesson.lesson_id} className="lesson-card" onClick={() => navigate(`/lessons/${lesson.lesson_id}`)}>
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
              {/* {students.length === 0 ? (
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
              )} */}

              {classroom.students.length === 0 ? (
                    <p>No students enrolled in this course yet.</p>
                ) : (
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classroom.students.map(student => (
                                <tr key={student.stu_user_id}>
                                    <td>{student.stu_user_id}</td>
                                    <td>{student.stu_user_fname} {student.stu_user_lname}</td>
                                    <td>{student.stu_user_email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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
