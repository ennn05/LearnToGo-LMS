import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Courses.css";

function StudentClassrooms() {
    const [activeTab, setActiveTab] = useState("my");
    const [user, setUser] = useState(null);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch classrooms the student is enrolled in
    const fetchClassrooms = async () => {
        try {
            const { data: res } = await api.get("classrooms");
            if (!res.success) {
                setClassrooms([]);
            } else {
                setClassrooms(res.data);
            }
        } catch (error) {
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
                    <button className="active">Classrooms</button>
                    <button className="logout-btn" onClick={handleLogout}>Log Out</button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <h1>Student List of Classrooms</h1>
                <div className="tabs">
                    <button
                        className={activeTab === "my" ? "tab-active-green" : ""}
                        onClick={() => setActiveTab("my")}
                        style={activeTab === "my" ? { backgroundColor: '#27ae60', color: 'white', fontWeight: 'bold' } : {}}
                    >
                        My Classrooms
                    </button>
                    <button
                        className={activeTab === "available" ? "active" : ""}
                        onClick={() => setActiveTab("available")}
                        disabled
                    >
                        Available Classrooms
                    </button>
                </div>
                <div className="classrooms-grid">
                    {loading ? (
                        <div className="loading">Loading classrooms...</div>
                    ) : classrooms.length === 0 ? (
                        <div className="no-classrooms">No classrooms found.</div>
                    ) : (
                        classrooms.map((cr) => (
                            <div className="classroom-card" key={cr.cr_id}>
                                <div className="classroom-header">
                                    <strong>Classroom:</strong> {cr.cr_id}
                                </div>
                                <div className="classroom-details">
                                    <p><strong>Course:</strong> {cr.course_name}</p>
                                    {/* Lessons and supervisor info if available */}
                                    <p><strong>Supervisor:</strong> {cr.supervisor_fname} {cr.supervisor_lname}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentClassrooms;