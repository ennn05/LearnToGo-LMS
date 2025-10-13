import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Classrooms.css";

function InstructorClassrooms() {
  const [activePage, setActivePage] = useState("classrooms");
  const [user, setUser] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [filter, setFilter] = useState("all"); // all, mine, others

  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const { data: res } = await api.get("courses"); // Fetch all courses
      if (res.success) {
        setAvailableCourses(res.data);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setAvailableCourses([]);
    }
  };

  const fetchClassrooms = async () => {
    try {
      console.log("Fetching classrooms from API...");
      const { data: res } = await api.get("classrooms");

      console.log("API response for classrooms:", res.data);
      if (!res.success) {
        console.error("Error fetching classrooms:", res.message);
      }

      console.log("Classrooms loaded:", res.data);
      setClassrooms(res.data);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClassrooms = classrooms.filter((cl) => {
    if (!user) return true; // fallback if user not loaded yet
    if (filter === "mine") {
      return cl.cr_creator === user.user_id;
    } else if (filter === "others") {
      return cl.cr_creator !== user.user_id;
    }
    return true; // "all"
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchClassrooms();
    fetchCourses();
  }, []);

  const handleClassroomClick = (classroomCode) => {
    console.log("CLASSROOM CLICKED");
    navigate(`/classrooms/${classroomCode}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const classroomsWithCourses = classrooms.map(cl => ({
    ...cl,
    courseObj: availableCourses.find(course => course.course_code === cl.course_code)
  }));

  console.log("Classrooms with course objects:", classroomsWithCourses);
  classroomsWithCourses.forEach(cl => {
    console.log(`Classroom ${cl.cr_id} course_status:`, cl.courseObj?.course_status);
  });

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
            <div className="role">{user ? user.user_role : "Loading..."}</div>
          </div>
        </div>

        <nav className="nav-menu">
          <button onClick={() => navigate("/courses")}>Courses</button>
          <button onClick={() => navigate("/lessons")}>Lessons</button>
          <button
            className={activePage === "classrooms" ? "active" : ""}
            onClick={() => setActivePage("classrooms")}
          >
            Classrooms
          </button>
          <button onClick={() => navigate("/students")}>Students</button>
          <button onClick={() => navigate("/reports")}>
            Reports & Statistics
          </button>
                  {user?.user_role === "admin" && (
            <button
              className={activePage === "instructors" ? "active" : ""}
              onClick={() => navigate("/instructors")}
            >
              Instructors
            </button>
          )}
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
              <p>No classrooms found. Create your first classroom!</p>
            </div>
          ) : (
            <div>
            <div className="filter-dropdown" style={{ marginBottom: "15px", textAlign: "right" }}>
              <label htmlFor="classroomFilter" style={{ marginRight: "8px" }}>Filter by Creator:</label>
              <select
                id="classroomFilter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Classrooms</option>
                <option value="mine">Created by Me</option>
                <option value="others">Created by Others</option>
              </select>
            </div>
            <div className="classrooms-grid">
              {filteredClassrooms.map((classroom) => (
                <div
                  key={classroom.cr_id}
                  className="classroom-card"
                  onClick={() => handleClassroomClick(classroom.cr_id)}
                >
                  {/* Card Header / Top Section */}
                  <div
                    className={`classroom-top-section ${classroom.cr_status.toLowerCase()}`}
                  >
                    <h3>Classroom ID: {classroom.cr_id}</h3>
                  </div>

                  {/* Card Body */}
                  <div className="classroom-body">

                    <div className="classroom-course-title">
                      <strong>Associated Course:</strong>{" "}
                      {classroom.course_code + " - " + classroom.course_title}
                    </div>

                    <div className="classroom-supervisor">
                      <strong>Supervisor ID:</strong> {classroom.supervisor_fname} {classroom.supervisor_lname} ({classroom.supervisor_id})
                    </div>

                    <div className="classroom-status">
                      <strong>Status:</strong>{" "}
                      {classroom.cr_status || "Draft"}
                    </div>

                    <div className="classroom-dates">
                      <strong>Start Date:</strong>{" "}
                      {classroom.cr_start_date
                        ? new Date(classroom.cr_start_date).toLocaleDateString()
                        : "N/A"}{" "}
                      <br />
                      <strong>Duration:</strong> {classroom.cr_duration || "N/A"} week(s)
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          )}
        </div>

        <button className="fab" onClick={() => navigate("/classrooms/create")}>
          +
        </button>
      </div>
    </div>
  );
}

export default InstructorClassrooms;