import "../styles/ClassroomGrade.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import useStore from "../store";

function ClassroomGrade() {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState("classrooms");
    const [classroom, setClassroom] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { classroom_id } = useParams();
    const { user, signOut } = useStore(s => s);

    const handleLogout = () => {
        localStorage.removeItem("user");
        signOut();
        navigate("/");
    };

    useEffect(() => {
        const fetchClassroom = async () => {
            try {
                const { data: res } = await api.get(`classrooms/${classroom_id}`);
                if (!res.success) {
                    console.error("Error fetching classroom:", res.message);
                    setError("Classroom not found");
                    return;
                }
                setClassroom(res.data);
            } catch (error) {
                console.error("Error fetching classroom:", error);
                setError("Classroom not found");
            } finally {
                setLoading(false);
            }
        };
        fetchClassroom();
    }, [classroom_id]);

    if (loading) {
        return (
            <div className="flex">
                <div className="main-content">
                    <div className="loading">
                        Loading classroom...
                    </div>
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
            {/** Sidebar */}
            <div className="sidebar">
                <div className="profile">
                    <div className="avatar"></div>
                    <div className="info">
                        <div className="name">
                            {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}
                        </div>
                        <div className="role">
                            {user?.user_role ?? "Instructor"}
                        </div>
                    </div>
                </div>
                {/** Navigation Menu */}
                <nav className="nav-menu">
                    <button className={activePage === "courses" ? "active" : ""} onClick={() => navigate("/courses")}>
                        Courses
                    </button>
                    <button className={activePage === "lessons" ? "active" : ""} onClick={() => navigate("/lessons")}>
                        Lessons
                    </button>
                    <button className={activePage === "classrooms" ? "active" : ""} onClick={() => navigate("/classrooms")}>
                        Classrooms
                    </button>
                    <button className={activePage === "students" ? "active" : ""} onClick={() => navigate("/students")}>
                        Students
                    </button>
                    <button className={activePage === "reports" ? "active" : ""} onClick={() => setActivePage("reports")}>
                        Reports & Statistics
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        Log Out
                    </button>
                </nav>
            </div>
            {/** Main Content */}
            <div className="main-content">
                <div className="topbar">
                    <h1>Classroom Grades</h1>
                </div>
            </div>
        </div>
    )
}

export default ClassroomGrade;
