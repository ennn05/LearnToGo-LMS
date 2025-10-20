import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/CourseDetails.css"; // ✅ use same stylesheet as instructor for consistent design
import useStore from "../store";

function StudentClassroomDetails() {
  const { classroomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useStore((state) => state);
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);

  // Location state: either 'my' or 'available', also possible stucourse_id
  const fromTab = location.state?.from;
  const stucourse_id = location.state?.stucourse_id;

  // Fetch classroom details
  const fetchClassroomDetails = async () => {
    try {
      const { data: res } = await api.get(`classrooms/${classroomCode}`);
      if (!res.success) {
        setError(res.message || "Classroom not found");
        setClassroom(null);
      } else {
        setClassroom(res.data);
      }
    } catch (err) {
      console.error("Error fetching classroom:", err);
      setError("Classroom not found");
      setClassroom(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassroomDetails();
    // eslint-disable-next-line
  }, [classroomCode]);

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  // New: Join logic, only for available classrooms not yet joined
  const handleJoinClassroom = async () => {
    if (!stucourse_id) return;
    setJoining(true);
    try {
      const { data: res } = await api.post(`classrooms/${classroomCode}/${stucourse_id}/join`);
      if (res.success) {
        alert("Successfully joined classroom!");
        navigate("/classrooms"); // After join, go back to list
      } else {
        alert(res.message || "Failed to join classroom");
      }
    } catch (error) {
      console.error("Error joining classroom:", error);
      alert(error?.response?.data?.message || "Error joining classroom");
    } finally {
      setJoining(false);
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
            <div className="role">{user?.user_role || "Student"}</div>
          </div>
        </div>
        <nav className="nav-menu">
          <button onClick={() => navigate("/courses")}>Courses</button>
          <button onClick={() => navigate("/lessons")}>Lessons</button>
          <button className="active" onClick={() => navigate("/classrooms")}>Classrooms</button>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
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
            {/* <div className="course-status">
              <span className={`status-badge ${classroom.cr_status?.toLowerCase() || "draft"}`}>
                {classroom.cr_status || "Draft"}
              </span>
            </div> */}
          {/* Join Button for available classrooms only */}
          {(fromTab === "available" && stucourse_id) && (
            <div style={{ marginTop: "2em", textAlign: "center" }}>
              <button className="join-btn" onClick={handleJoinClassroom} disabled={joining}>
                {joining ? "Joining..." : "Join Classroom"}
              </button>
            </div>
          )}
          </div>
          {/* Classroom Info */}
          <div className="course-info">
            <div className="info-item">
              <label>Classroom ID:</label>
              <span>{classroom.cr_id}</span>
            </div>
            <div className="info-item">
              <label>Date Created:</label>
              <span>{classroom.cr_date_created ? new Date(classroom.cr_date_created).toLocaleDateString() : "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Start Date:</label>
              <span>{classroom.cr_start_date ? new Date(classroom.cr_start_date).toLocaleDateString() : "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Duration:</label>
              <span>{classroom.cr_duration || "N/A"} week(s)</span>
            </div>
            <div className="info-item">
              <label>Created By:</label>
              <span>{classroom.creator_fname} {classroom.creator_lname}</span>
            </div>
          </div>
          {/* Supervisor + Course */}
          <div className="supervisor-course-section">
            <div className="form-row">
              <div className="form-group">
                <label>Supervisor:</label>
                <span>{classroom.supervisor_fname} {classroom.supervisor_lname || "N/A"}</span>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Course:</label>
                <span className="course-link" onClick={() => navigate(`/courses/${classroom.course_code}`)}>
                  {classroom.course_code} - {classroom.course_title}
                </span>
              </div>
            </div>
          </div>
          {/* Lessons Section */}
          <div className="lessons-section">
            <h3>Lessons</h3>
            <div className="course-lessons-container">
              {classroom.lessons?.length === 0 ? (
                <p className="no-lessons">No lessons assigned yet.</p>
              ) : (
                <div className="course-lessons-grid">
                  {classroom.lessons.map((lesson) => (
                    <div 
                      key={lesson.lesson_id} 
                      className="course-lesson-card" 
                      onClick={() => navigate(`/lessons/${lesson.lesson_id}`)}
                    >
                      <h4 className="course-lesson-title">{lesson.lesson_title}</h4>
                      <div className="course-lesson-credits">{lesson.lesson_credit ?? 0} credits</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* 🚫 Students Section skipped (only instructors need that) */}
        </div>
      </div>
    </div>
  );
}

export default StudentClassroomDetails;
