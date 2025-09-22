import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Courses.css";

function StudentClassroomDetails() {
    const { classroomCode } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [classroom, setClassroom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            setError("Classroom not found");
            setClassroom(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchClassroomDetails();
    }, [classroomCode]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    if (loading) {
        return <div className="loading">Loading classroom...</div>;
    }
    if (error || !classroom) {
        return (
            <div className="error">
                <h2>Error</h2>
                <p>{error || "Classroom not found"}</p>
                <button onClick={() => navigate("/classrooms")}>Back to Classrooms</button>
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
                    <button className="active">Classrooms</button>
                    <button className="logout-btn" onClick={handleLogout}>Log Out</button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <h1>Classroom Details</h1>
                <div className="classroom-details-container">
                    <div className="classroom-meta">
                        <p><strong>Classroom ID:</strong> {classroom.cr_id}</p>
                        <p><strong>Start Date:</strong> {classroom.cr_start_date}</p>
                        <p><strong>Duration:</strong> {classroom.cr_duration} weeks</p>
                        <p><strong>Created by:</strong> {classroom.creator_fname} {classroom.creator_lname}</p>
                    </div>
                    <div className="classroom-info">
                        <p><strong>Supervisor:</strong> {classroom.supervisor_fname} {classroom.supervisor_lname}</p>
                        <p><strong>Course:</strong> <span className="course-link" onClick={() => navigate(`/courses/${classroom.course_code}`)}>{classroom.course_code} - {classroom.course_name}</span></p>
                        <div className="lesson-list">
                            <strong>Lessons:</strong>
                            {classroom.lessons && classroom.lessons.length > 0 ? (
                                classroom.lessons.map((lesson) => (
                                    <div key={lesson.lesson_id} className="lesson-link" onClick={() => navigate(`/lessons/${lesson.lesson_id}`)}>
                                        {lesson.lesson_id} - {lesson.lesson_title}
                                    </div>
                                ))
                            ) : (
                                <p>No lessons found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentClassroomDetails;