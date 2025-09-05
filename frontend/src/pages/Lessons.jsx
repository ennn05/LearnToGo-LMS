import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Lessons.css";

function Lessons() {
  const [activePage, setActivePage] = useState("lessons");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="flex">
      <div className="sidebar">
        <h1>Lessons</h1>

        <div className="profile">
          <div className="avatar"></div>
          <div className="info">
            <div className="name">{user?.instructor_name || "Loading..."}</div>
            <div className="role">Instructor</div>
          </div>
        </div>

        <button
          className={activePage === "lessons" ? "active" : ""}
          onClick={() => setActivePage("lessons")}
        >
          Lessons
        </button>

        <button
          className={activePage === "courses" ? "active" : ""}
          onClick={() => setActivePage("courses")}
        >
          Courses
        </button>
      </div>

      <div className="main-content">
        {activePage === "lessons" && (
          <div>
            <h2>Lessons</h2>
            <p>Here you can manage lessons...</p>
          </div>
        )}

        {activePage === "courses" && (
          <div>
            <h2>Courses</h2>
            <p>Here you can manage courses...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Lessons;