import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Classrooms.css"; // use the same CSS for consistency

function StudentClassrooms() {
  const [user, setUser] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch classrooms the student is enrolled in
  const fetchClassrooms = async () => {
    try {
      const { data: res } = await api.get("classrooms");
      if (res.success) {
        setClassrooms(res.data);
      } else {
        setClassrooms([]);
      }
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      setClassrooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchClassrooms();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleClassroomClick = (classroomCode) => {
    navigate(`/classrooms/${classroomCode}`);
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
            <div className="role">{user?.user_role || "Student"}</div>
          </div>
        </div>

        <nav className="nav-menu">
          <button onClick={() => navigate("/courses")}>Courses</button>
          <button onClick={() => navigate("/lessons")}>Lessons</button>
          <button className="active" onClick={() => navigate("/classrooms")}>Classrooms</button>
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <h1>My Classrooms</h1>
        </div>

        <div className="classrooms-container">
          {loading ? (
            <div className="loading">Loading classrooms...</div>
          ) : classrooms.length === 0 ? (
            <div className="no-classrooms">
              <p>No classrooms found. Please check with your instructor.</p>
            </div>
          ) : (
            <div className="classrooms-grid">
              {classrooms.map((classroom) => (
                <div
                  key={classroom.cr_id}
                  className="classroom-card"
                  onClick={() => handleClassroomClick(classroom.cr_id)}
                >
                  {/* Card Header / Top Section */}
                  <div
                    className={`classroom-top-section ${classroom.cr_status?.toLowerCase() || "draft"}`}
                  >
                    <h3>Classroom ID: {classroom.cr_id}</h3>
                  </div>

                  {/* Card Body */}
                  <div className="classroom-body">
                    <div className="classroom-course-title">
                      <strong>Course:</strong> {classroom.course_name}
                    </div>

                    <div className="classroom-supervisor">
                      <strong>Supervisor:</strong>{" "}
                      {classroom.supervisor_fname} {classroom.supervisor_lname}
                    </div>

                    <div className="classroom-status">
                      <strong>Status:</strong>{" "}
                      {classroom.cr_status || "Ongoing"}
                    </div>

                    <div className="classroom-dates">
                      <strong>Start Date:</strong>{" "}
                      {classroom.cr_start_date
                        ? new Date(classroom.cr_start_date).toLocaleDateString()
                        : "N/A"}
                      <br />
                      <strong>Duration:</strong>{" "}
                      {classroom.cr_duration || "N/A"} week(s)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentClassrooms;
