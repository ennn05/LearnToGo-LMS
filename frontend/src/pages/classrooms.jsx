import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Classrooms.css";

function Classrooms() {
  const [activePage, setActivePage] = useState("classrooms");
  const [user, setUser] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchClassrooms = async () => {
    try {
      console.log("Fetching classrooms from API...");
      const { data: res } = await api.get("classrooms");

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchClassrooms();
  }, []);

  const handleClassroomClick = (classroomCode) => {
    console.log("CLASSROOM CLICKED");
    navigate(`/classrooms/${classroomCode}`);
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
            <div className="classrooms-grid">
              {classrooms.map((classroom) => (
                <div
                  key={classroom.classroom_code}
                  className="classroom-card"
                  onClick={() => handleClassroomClick(classroom.classroom_code)}
                >
                  <div className="classroom-code">
                    {classroom.classroom_code}
                  </div>
                  <div className="classroom-name">
                    {classroom.classroom_name}
                  </div>
                  <div className="classroom-capacity">
                    Capacity: {classroom.classroom_capacity}
                  </div>
                </div>
              ))}
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

export default Classrooms;