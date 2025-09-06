// import api from "../libs/apiCalls";
import {React, useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import "../styles/students.css";


const Students = () => {
    const [activePage, setActivePage] = useState("students");

    const [user, setUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    const fetchStudents = async () => {
        try {
            console.log("Fetching students from API...");
            // const { data : res } = await api.get("students");
            // console.log("Students loaded: ", res?.data)
            // setStudents(res?.data);
            
            const response = await fetch("http://localhost:5000/api/students");
            console.log(response);
            const data = await response.json();
            console.log("Students loaded: ", data.data);
            setStudents(data.data);

        } catch(error) {
            console.error(error)

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
        // For testing: create a mock user if no user is logged in
        setUser({
            user_fname: "Test",
            user_lname: "User",
            user_email: "test@example.com",
            user_role: "Instructor",
        });
        }
        fetchStudents();
    }, []);


    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const handleRemove = () => {

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
            <div className="role">{user ? `${user.user_role}`: ``}</div>
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
            onClick={() => setActivePage("classrooms")}
          >
            Classrooms
          </button>
          <button
            className={activePage === "students" ? "active" : ""}
            onClick={() => setActivePage("students")}
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
          <h1>Students</h1>
        </div>

        {/* Students Grid */}
        <div className="students-container">
          {loading ? (
            <div className="loading">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="no-students">
              <p>No students found.</p>
            </div>
          ) : (
                <>
                    <table className="students-table">
                        <thead>
                            <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                            <tr key={s.user_id}>
                                <td>{`${s.user_fname} ${s.user_lname}`}</td>
                                <td>{s.user_email}</td>
                                <td>
                                <button onClick={() => handleRemove(s.id)}>Remove</button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </>
          )}
        </div>
      </div>
    </div>

    );
}

export default Students;