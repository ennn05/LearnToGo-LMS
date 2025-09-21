import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateClassroom.css"; // Stylesheet for page

function CreateClassroom() {
    // Sidebar state
    const [activePage, setActivePage] = useState("classrooms")

    // User info
    const [user, setUser] = useState(null);

    // Default classroom
    const [classroomData, setClassroomData] = useState({
        classroomId: "",
        startDate: "",
        duration: "",
        createdDate: "",
        updatedDate: "",
        author: "",
        supervisor: "",
        status: "draft"
    })

    // Lessons & Courses
    const [assignedCourse, setAssignedCourse] = useState(null);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [assignedLessons, setAssignedLessons] = useState([]);
    const [availableLessons, setAvailableLessons] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // All courses are fetched
    // TODO: api changes neded in the future
    const fetchCourses = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/courses/published");
            if (!response.ok) {
                console.error("API error:", response.status, response.statusText);
                setAvailableCourses([]);
                return;
            }
            const data = await response.json();
            setAvailableCourses(
                data.data.filter(course => course.status === "published")
            );
        } catch (error) {
            console.error("Error fetching courses:", error);
            setAvailableCourses([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetches specific lessons assigned based on course_code
    const fetchLessonsForCourse = async course_code => {
        try {
            const response = await fetch(`http://localhost:5000/api/lessons/published`);
            if (!response.ok) {
                console.error("API error:", response.status, response.statusText);
                setAvailableLessons([]);
                return;
            }
            const data = await response.json();
            const filteredLessons = data.data.filter(
                lesson => lesson.cl_course_code === course_code
            );
            setAvailableLessons(filteredLessons);
        } catch (error) {
            console.error("Error fetching lessons:", error);
            setAvailableLessons([]);
        }
    };

    const fetchAvailableStudents = async courseCode => {
        try {

            // note: both of these api will work (depending on whether u want to get all students (group by all courses) or students for a specific course only)
            // const response = await fetch(`http://localhost:5000/api/courses/enrolled-students`);
            const response = await fetch(`http://localhost:5000/api/courses/enrolled-students/${courseCode}`);

            if (!response.ok) {
                console.error("API error:", response.status, response.statusText);
                // setAvailableStudents([]);
                return; 
            }
            const data = await response.json();
            console.log("Enrolled students:", data.data);
            // setAvailableStudents(data.data);
        } catch (error) {
            console.error("Error fetching students:", error);
            // setAvailableStudents([]);
        }
    };

    // Mount: load user and courses
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser({
                user_fname: "Test",
                user_lname: "User",
                user_email: "test@example.com",
                user_role: "Instructor",
            });
        }
        fetchCourses();
        // fetchAvailableStudents("C2006");
    }, []);

    // When a course is selected, fetch its lessons
    const handleCourseSelect = course => {
        setAssignedCourse(course);
        setAssignedLessons([]);
        fetchLessonsForCourse(course.course_code);
    };

    // Input change method
    const handleInputChange = e => {
        const { name, value } = e.target;
        setClassroomData((prev) => ({ ...prev, [name]: value }));
    };

    // Status change method
    const handleStatusChange = newStatus => {
        setClassroomData(prev => ({
            ...prev,
            status: newStatus,
        }));
    };

    // Publishing classroom
    const handlePublishClassroom = async () => {
        try {
            if (!classroomData.classroomId || !classroomData.startDate || !assignedCourse) {
                alert("Please fill in all required fields before submitting.")
                return;
            }

            const publishedClassroomData = { ...classroomData, status: "published" };
            setClassroomData(publishedClassroomData);
            console.log("Publishing classroom:", classroomData);
            alert("Classroom published successfully!");
            navigate("/classrooms");
        } catch (error) {
            console.error("Error publishing classroom:", error);
            alert("Failed to publish classroom! Try again.");
        }
    };

    // Assign lesson to classroom
    const addLessonToClassroom = lesson => {
        if (!assignedLessons.find(l => l.lesson_id === lesson.lesson_id)) {
            setAssignedLessons(prev => [...prev, lesson]);
        }
    };

    // Remove lesson from classroom
    const removeLessonFromClassroom = lesson => {
        setAssignedLessons(prev => prev.filter(l => l.lesson_id === lesson.lesson_id))
    }

    // Save current state of classroom
    const handleSaveClassroom = async () => {
        try {
            if (!classroomData.classroomId || !classroomData.startDate) {
                alert("Please fill in all required fields before submitting.")
                return;
            }

            const classroomToSave = {
                classroom_id: classroomData.classroomId,
                start_date: classroomData.startDate,
                duration: classroomData.duration,
                status: classroomData.status,
                course: assignedCourse.course_code,
                lessons: assignedLessons.map(l => l.lesson_id),
                author: user.user_id,
            };

            const response = await fetch("http://localhost:5000/api/classrooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(classroomToSave),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save classroom!");
            }

            alert("Classroom saved successfully!");
            navigate("/classrooms");
        } catch (error) {
            console.error("Error saving classroom:", error);
            alert("Failed to save classroom! Try again.");
        }
    };

    // Cancel btn fn
    const handleCancel = () => {
        navigate("/classrooms");
    };

    // Logout btn fn
    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const currentDate = new Date().toLocaleDateString();

    // Lesson searchbar filtering
    const filteredLessons = Array.isArray(availableLessons) ? availableLessons.filter(
        lesson =>
            lesson.lesson_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lesson.lesson_desc?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

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
                    <button className={activePage === "classrooms" ? "active" : ""} onClick={() => setActivePage("classrooms")}>
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
                    <h1>New Classroom</h1>
                </div>
                <div className="create-classroom-container">
                    {/** Classroom Header with Status and Actions */}
                    <div className="classroom-header">
                        <div className="classroom-status">
                            <span className={`status-badge ${classroomData.status}`}>
                                {classroomData.status.charAt(0).toUpperCase() + classroomData.status.slice(1)}
                            </span>
                        </div>
                        <div className="classroom-actions">
                            <button className="btn-publish" onClick={handlePublishClassroom}>
                                Publish
                            </button>
                            <button className="btn-archive" onClick={() => handleStatusChange("archived")}>
                                Archive
                            </button>
                        </div>
                    </div>
                    {/** Classroom Form */}
                    <div className="classroom-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Course Code:</label>
                                <input 
                                    type="text"
                                    name="classroomId"
                                    value={classroomData.classroomId}
                                    onChange={handleInputChange}
                                    placeholder="e.g. C2001"
                                />
                            </div>
                            <div className="form-group">
                                <label>Date Created:</label>
                                <span className="readonly-field">{currentDate}</span>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date:</label>
                                <input 
                                    type="date"
                                    name="startDate"
                                    value={classroomData.startDate}
                                    onChange={handleInputChange}
                                    placeholder={currentDate}
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Updated:</label>
                                <span className="readonly-field">{currentDate}</span>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Duration:</label>
                                <input 
                                    type="number"
                                    name="duration"
                                    value={classroomData.duration}
                                    onChange={handleInputChange}
                                    min="1"
                                />
                                <label>week(s)</label>
                            </div>
                            <div className="form-group">
                                <label>Created By:</label>
                                <span className="readonly-field">
                                    {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/** Supervisor & Course Section */}
                    <div className="supervisor-course-section">
                        {/** Supervisor Selection */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>Supervisor:</label>
                                <select 
                                    name="supervisor"
                                    value={classroomData.supervisor}
                                    onChange={handleInputChange}
                                    className="supervisor-select"
                                >
                                    {/** For now, only current instructor */}
                                    {user && (
                                        <option value={user.user_id || "instructor"}>
                                            {user.user_fname} {user.user_lname}
                                        </option>
                                    )}
                                </select>
                            </div>
                        </div>
                        {/** Course Selection */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>Assign Course:</label>
                                <select 
                                    value={assignedCourse?.course_code || ""} 
                                    onChange={(e) => {
                                        const selected = availableCourses.find(c => c.course_code === e.target.value);
                                        handleCourseSelect(selected);
                                    }}
                                    className="course-select"
                                >
                                    <option value="">-- Select a course --</option>
                                    {availableCourses.map(course => (
                                        <option value={course.course_code}>
                                            {course.course_code} - {course.course_title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    {/** Lessons Section */}
                    <div className="lesson-section">
                        {/** Assigned Lessons */}
                        <div className="lessons-assigned">
                            <h3>Lessons Assigned</h3>
                            <div className="assigned-lessons-container">
                                {assignedLessons.length === 0 ? (
                                    <p className="no-lessons">No lessons assigned yet.</p>
                                ) : (
                                    assignedLessons.map(lesson => (
                                        <div key={lesson.lesson_id} className="assigned-lesson-card">
                                            <div className="lesson-info">
                                                <h4>{lesson.lesson_title}</h4>
                                                <p>{lesson.lesson_desc}</p>
                                            </div>
                                            <div className="lesson-actions">
                                                <span className="check-icon">✓</span>
                                                <button className="remove-button" onClick={() => removeLessonFromClassroom(lesson)}>×</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        {/** Available Lessons */}
                        <div className="lessons-available">
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Search lessons..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <div className="available-lessons-grid">
                                {loading ? (
                                    <div className="loading">Loading lessons...</div>
                                ) : (
                                    filteredLessons.map(lesson => (
                                        <div key={lesson.lesson_id} className="available-lesson-card">
                                            <div className="lesson-content">
                                                <h4>{lesson.lesson_title}</h4>
                                                <p>{lesson.lesson_desc}</p>
                                            </div>
                                            <button
                                                className={`add-btn ${assignedLessons.find(l => l.lesson_id === lesson.lesson_id) ? "added" : ""}`}
                                                onClick={() => addLessonToClassroom(lesson)}
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
                    {/** Save & Cancel btns */}
                    <div className="save-section">
                        <button className="btn-save" onClick={handleSaveClassroom}>Save</button>
                        <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateClassroom;