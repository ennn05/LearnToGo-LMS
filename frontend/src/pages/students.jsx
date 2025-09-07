// import api from "../libs/apiCalls";
import {React, useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import "../styles/students.css";


const Students = () => {
    const [activePage, setActivePage] = useState("students");
    // const user = useStore((state) => state);
    const [user, setUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
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
        console.log(storedUser);
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } 
        fetchStudents();
    }, []);


    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const handleRemove = async (stuUserId) => {
        if (window.confirm("Are you sure you want to remove this student?")) {
    
            const prevStudents = [...students];

            try {
                console.log("Deleting student from API...");
                // const { data : res } = await api.get("students");
                // console.log("Students loaded: ", res?.data)
                // setStudents(res?.data);
                
                const res = await fetch(`http://localhost:5000/api/students/${stuUserId}`, {
                    method: "DELETE",
                    headers: {
                    "Content-Type": "application/json",
                    },
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText);
                }

                const data = await res.json();
                console.log("Deleted:", data.data);
                setMessage({ text: "Student removed successfully!", type: "success" });

                // Auto-hide after 3s
                setTimeout(() => setMessage(null), 3000);

                // Optimistically update UI
                setStudents(students.filter((s) => s.user_id !== stuUserId));

                // const res = await api.delete(`/students/${stuId}`);
                // console.log("Deleted:", res.data.message);

            } catch(error) {
                console.error("Error deleting student:", error.message);
                setMessage({ text: "Failed to remove student. Please try again.", type: "error" });
                setTimeout(() => setMessage(null), 3000);

            } finally {
                setLoading(false);
            }
        }
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
        {message && (
        <div className={`feedback ${message.type}`}>
            {message.text}
        </div>
        )}
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
                            <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                            <tr key={s.user_id}>
                                <td>{`${s.user_fname} ${s.user_lname}`}</td>
                                <td>{s.user_email}</td>
                                <td className="action">
                                <button onClick={() => handleRemove(s.user_id)}>Remove</button>
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