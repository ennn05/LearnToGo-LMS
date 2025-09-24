import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditCourse.css";
import useStore from "../store";
import api from "../libs/apiCalls";

function EditCourse() {
    const { courseId } = useParams();
    const [activePage, setActivePage] = useState("courses");
    const {user, signOut} = useStore((state) => state);
    const [courseData, setCourseData] = useState({
            course_code: "",
            course_title: "",
            course_status: "draft",
            course_total_credit: 0,
            lessons: [],
            });
    const [assignedLessons, setAssignedLessons] = useState([]);
    const [availableLessons, setAvailableLessons] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCourseDetails = async () => {
        try {
            console.log("Fetching course details");
            const {data: res} = await api.get(`courses/${courseId}`);
            if (!res.success) {
                console.error("Error fetching courses:", res.message);
            }

            const course = res.data;

            setCourseData({
                ...course,
                course_total_credit: course.course_total_credit || 0,
            });
            setAssignedLessons(course.lessons || []);
            console.log("Course details loaded:", res.data);
            console.log(res.data.lessons);
            // setCourseData(data.data);
        } catch (error) {
            console.error("Error fetching course details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLessons = async () => {
        try {
            const {data: res} = await api.get("lessons");
            console.log(res);
            if (!res.success) {
                console.error("API error:", res.message);
                setAvailableLessons([]);
                return;
            }
            
            setAvailableLessons(
                res.data.filter(lesson => lesson.lesson_status === "published")
            );
        } catch (error) {
            console.error("Error fetching lessons:", error);
            setAvailableLessons([]);
        }
    };

    useEffect(() => {
        // const storedUser = localStorage.getItem("user");
        // if (storedUser) {
        //     setUser(JSON.parse(storedUser));
        // } else {
        //     // Mock user
        //     setUser({
        //         user_fname: "Test",
        //         user_lname: "User",
        //         user_email: "test@example.com",
        //         user_role: "Instructor",
        //     });
        // }
        fetchCourseDetails();
        fetchLessons();
    }, [courseId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prev => ({
            ...prev,
            [name]: value,
            course_total_credit: assignedLessons.reduce((sum, lesson) => lesson.lesson_credit + sum, 0)
        }));
    };

    const handleStatusChange = (newStatus) => {
        setCourseData(prev => ({
            ...prev,
            course_status: newStatus
        }));
    };

    const handlePublishCourse = async () => {
        try {
            if (!courseData.course_code || !courseData.course_title || courseData.course_total_credit <= 0) {
                alert("Please fill in all required fields (Course Code, Title, and Credits) before publishing.");
                return;
            }

            const publishedCourseData = {
                ...courseData,
                course_status: "published",
                course_total_credit: assignedLessons.reduce((sum, l) => sum + Number(l.lesson_credit || 0), 0), 
                lessons: assignedLessons
            };

            // Save updates before marking as published
            const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(publishedCourseData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to publish course");
            }

            // // Update lessons
            // await fetch(`http://localhost:5000/api/courses/${courseId}/lessons`, {
            //     method: "PUT",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({ lessons: assignedLessons.map(l => l.lesson_id) })
            // });

            alert("Course published successfully!");
            navigate("/courses");

        } catch (error) {
            console.error("Error publishing course:", error);
            alert("Failed to publish course. Please try again.");
        }
    };


    const addLessonToCourse = (lesson) => {
        if (!assignedLessons.find(l => l.lesson_id === lesson.lesson_id)) {
            setAssignedLessons(prev => [...prev, lesson]);
        }
    };

    const removeLessonFromCourse = (lessonId) => {
        setAssignedLessons(prev => prev.filter(l => l.lesson_id !== lessonId));
    };

    const filteredLessons = Array.isArray(availableLessons)
        ? availableLessons.filter(
            (lesson) =>
                lesson.lesson_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lesson.lesson_desc?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        : [];
    
    const handleSaveCourse = async () => {
        try {
            if (!courseData.course_code || !courseData.course_title) {
                alert("Please fill in all required fields (Course Code and Title) before saving.");
                return;
            }

            const courseToUpdate = {
                course_code: courseData.course_code,
                course_title: courseData.course_title,
                course_status: courseData.course_status,   
                course_total_credit: assignedLessons.reduce((sum, l) => sum + Number(l.lesson_credit || 0), 0), 
                course_date_updated: currentDate,
                lessons: assignedLessons
            };

            // Update course metadata
            const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(courseToUpdate)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save course details");
            }

            // Update lesson assignments
            // const res = await fetch(`http://localhost:5000/api/courses/${courseId}/lessons`, {
            //     method: "PUT",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({ lessons: assignedLessons.map(l => l.lesson_id) }) 
            // });

            // if (!res.ok) {
            //     const errorData = await res.json();
            //     throw new Error(errorData.message || "Failed to update lessons");
            // }

            alert("Course saved successfully!");
            navigate("/courses");

        } catch (error) {
            console.error("Error saving course:", error);
            alert("Failed to save course. Please try again.");
        }
    };

    const handleCancel = () => {
        navigate(`/courses/${courseId}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        signOut();
        navigate("/");
    };

    const currentDate = new Date().toLocaleDateString();

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
                    <h1>Edit Course</h1>
                </div>
                <div className="edit-course-container">
                    {/** Course Header with Status and Actions */}
                    <div className="course-header">
                        <div className="course-status">
                            <span className={`status-badge ${courseData.course_status}`}>
                                {courseData.course_status.charAt(0).toUpperCase() + courseData.course_status.slice(1)}
                            </span>
                        </div>
                        <div className="course-actions">
                            {courseData.course_status.toLowerCase() !== "published" ?
                                (
                                <button className="btn-publish" onClick={()=>handleStatusChange("published")}>
                                    Publish
                                </button>
                                ) : ('')}
                            {courseData.course_status.toLowerCase() !== "archived" ? (
                                <button
                                    className="btn-archive"
                                    onClick={() => handleStatusChange("archived")}
                                >
                                    Archive
                                </button>
                                ) : ('')}

                        </div>
                    </div>
                    {/** Course Form */}
                    <div className="course-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Course Code:</label>
                                <span className="readonly-field">
                                    {courseData.course_code }
                                </span>
                                {/* <input
                                    type="text"
                                    name="course_code"
                                    value={courseData.course_code || ""}
                                    onChange={handleInputChange}
                                    placeholder="e.g., C2001"
                                /> */}
                            </div>
                            <div className="form-group">
                                <label>Date Created:</label>
                                <span className="readonly-field">
                                    {courseData.course_date_created ? new Date(courseData.course_date_created).toLocaleDateString() : currentDate}
                                </span>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Course Title:</label>
                                <input
                                    type="text"
                                    name="course_title"
                                    value={courseData.course_title || ""}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Web Development"
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Updated:</label>
                                <span className="readonly-field">{currentDate}</span>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Total Credits:</label>
                                <span className="readonly-field">{courseData.course_total_credit || 0}</span>
                            </div>
                            <div className="form-group">
                                <label>Created By:</label>
                                <span className="readonly-field">
                                    {courseData ? `${courseData.user_fname} ${courseData.user_lname}` : "Loading..."}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Lessons Section */}
                    <div className="lessons-section">
                        <div className="lessons-assigned">
                            <h3>Lessons Assigned</h3>
                            <div className="assigned-lessons-container">
                                {assignedLessons.length === 0 ? (
                                    <p className="no-lessons">No lessons assigned yet.</p>
                                ) : (
                                    assignedLessons.map((lesson) => (
                                    <div key={lesson.lesson_id} className="assigned-lesson-card">
                                        <div className="lesson-info">
                                            <h4>{lesson.lesson_title}</h4>
                                            <p>{lesson.lesson_desc}</p>
                                        </div>
                                        <div className="lesson-actions">
                                            <span className="check-icon">✓</span>
                                            <button
                                                className="remove-btn"
                                                onClick={() => removeLessonFromCourse(lesson.lesson_id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="lessons-available">
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Search lessons..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <div className="available-lessons-grid">
                                {loading ? (
                                    <div className="loading">Loading lessons...</div>
                                ) : (
                                    filteredLessons.map((lesson) => (
                                        <div key={lesson.lesson_id} className="available-lesson-card">
                                            <div className="lesson-content">
                                                <h4>{lesson.lesson_title}</h4>
                                                <p>{lesson.lesson_desc}</p>
                                            </div>
                                            <button
                                                className={`add-btn ${assignedLessons.find(l => l.lesson_id === lesson.lesson_id) ? "added" : ""}`}
                                                onClick={() => addLessonToCourse(lesson)}
                                                disabled={assignedLessons.find(l => l.lesson_id === lesson.lesson_id)}
                                            >
                                                {assignedLessons.find(l => l.lesson_id === lesson.lesson_id) ? "✓" : "+"}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Save and Cancel */}
                    <div className="save-section">
                        <button className="btn-save" onClick={handleSaveCourse}>
                            Save
                        </button>
                        <button className="btn-cancel" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditCourse;
