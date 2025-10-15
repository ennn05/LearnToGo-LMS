import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store";
import "../styles/Courses.css"; // reuse your existing CSS for consistent layout

function ReportsPage() {
  const [activePage, setActivePage] = useState("reports");
  const { user, signOut } = useStore((state) => state);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    signOut();
    navigate("/");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Profile section */}
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
        {/* Topbar */}
        <div className="topbar">
          <h1>Reports & Statistics</h1>
        </div>

        {/* Content Area */}
        <div className="content">
          <p>This page will show instructor reports and statistics.</p>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
