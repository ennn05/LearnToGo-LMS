import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/LessonDetails.css";
import useStore from "../store";
import medalBadge from "../assets/medal.png";
import crossedMedal from "../assets/crossed_medal.png";
import Confetti from "react-confetti";

function StudentLessonDetails() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { user, signOut } = useStore((state) => state);
    const [lesson, setLesson] = useState(null);
    const [grade, setGrade] = useState(null);
    const [completionText, setCompletionText] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

     const getCompletionText = (completion) => {
        if (completion === true) return "Completed";
        if (completion === false) return "Not Completed";
        return "Not Attempted";
    };

    const fetchLessonDetails = async () => {
        try {
            const { data: res } = await api.get(`lessons/${lessonId}`);
            if (!res.success) {
                setError(res.message || "Lesson not found");
                setLesson(null);
            } else {
                console.log("Lessons fetched:", res.data);
                setLesson(res.data);
                setGrade(res.data.grade_value);
                setCompletionText(getCompletionText(res.data.completion));
            }
        } catch (err) {
            console.error("Error fetching lesson details:", err);
            setError("Lesson not found");
            setLesson(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessonDetails();
    }, [lessonId]);

    useEffect(() => {
        if (lesson.completion) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [lesson]);

    const handleBack = () => navigate("/lessons");

    const handleLogout = () => {
        signOut();
        navigate("/login");
    };

    if (loading) {
        return <div className="loading">Loading lesson...</div>;
    }

    if (error || !lesson) {
        return (
            <div className="error">
                <h2>Error</h2>
                <p>{error || "Lesson not found"}</p>
                <button onClick={handleBack}>Back to Lessons</button>
            </div>
        );
    }

    return (
        <div className="flex">
            {showConfetti && <Confetti recycle={false} />}
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
                    <button onClick={() => navigate("/lessons")} className="active">Lessons</button>
                    <button onClick={() => navigate("/classrooms")}>Classrooms</button>
                    <button className="logout-btn" onClick={handleLogout}>Log Out</button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="topbar">
                    <h1>Lessons</h1>
                </div>
                <div className="lesson-details-container">
                    {/* Header Section */}
                    <div className="lesson-header">
                        <div className="lesson-meta">
                            <h2>{lesson.lesson_title || "Untitled Lesson"}</h2>
                            <p><strong>ID:</strong> {lesson.lesson_id || "NULL"}</p>
                            <p><strong>By:</strong> {lesson.user_fname && lesson.user_lname ? `${lesson.user_fname} ${lesson.user_lname}` : "Unknown"}</p>
                            <p><strong>Created:</strong> {lesson.lesson_date_created ? new Date(lesson.lesson_date_created).toLocaleDateString() : "NULL"}</p>
                            <p><strong>Last Updated:</strong> {lesson.lesson_date_updated ? new Date(lesson.lesson_date_updated).toLocaleDateString() : "NULL"}</p>
                        </div>
                    </div>
                    {/* Progress Section */}
                    <div className="lesson-progress-card">
                        <h3>LESSON PROGRESS</h3>
                        {grade !== null && (
                            <p><strong>Grade:</strong> {grade}%</p>
                        )}
                        <p><strong>Status:</strong> {completionText}</p>
                        {lesson.completion && (
                            <div className="completion-badge">
                                <img
                                    src={medalBadge}
                                    alt="Lesson Completed Badge"
                                    className="badge-image"
                                    title="Congratulations, you have earned a completion badge!"
                                />
                                <span className="badge-label">Completed</span>
                            </div>
                        )}
                        {!lesson.completion && (
                            <div className="incomplete-badge">
                                <img
                                    src={crossedMedal}
                                    alt="Incomplete Badge"
                                    className="badge-image"
                                    title="Pass this lesson to earn this badge!"
                                />
                                <span className="badge-label">Incomplete</span>
                            </div>
                        )}
                    </div>
                    {/* Details Section */}
                    <div className="lesson-content">
                        <div className="info-item">
                            <label>Description:</label>
                            <p>{lesson.lesson_desc}</p>
                        </div>
                        <div className="info-item">
                            <label>Objective:</label>
                            <p>{lesson.lesson_obj}</p>
                        </div>
                        <div className="info-item">
                            <label>Estimated Time:</label>
                            <p>{lesson.lesson_effort_per_week ?? 0} hours per week</p>
                        </div>
                        <div className="info-item">
                            <label>Lesson Credit:</label>
                            <p>{lesson.lesson_credit ?? 0} credit points</p>
                        </div>
                        <div className="info-item">
                            <label>Pre-requisites:</label>
                            {lesson.lesson_prereq && lesson.lesson_prereq.trim().length > 0 ? (
                                <ul>
                                    {lesson.lesson_prereq.trim().split("\\n").map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-items">No pre-requisites.</p>
                            )}
                        </div>
                    </div>
                    {/* Reading List */}
                    <div className="list-section">
                        <h3>Reading List</h3>
                        <div className="scroll-list">
                            {lesson.lesson_reading_list?.length > 0 ? (
                                lesson.lesson_reading_list.trim().split("\n").map((item, idx) => (
                                    <div key={idx} className="list-item">{item}</div>
                                ))
                            ) : (
                                <p className="no-items">No reading materials yet.</p>
                            )}
                        </div>
                    </div>
                    {/* Assignments */}
                    <div className="list-section">
                        <h3>Assignments</h3>
                        <div className="scroll-list">
                            {lesson.lesson_assignment?.length > 0 ? (
                                lesson.lesson_assignment.trim().split("\n").map((item, idx) => (
                                    <div key={idx} className="list-item">{item}</div>
                                ))
                            ) : (
                                <p className="no-items">No assignments yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentLessonDetails;
