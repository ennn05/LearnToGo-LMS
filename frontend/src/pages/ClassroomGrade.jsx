import "../styles/ClassroomGrade.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import useStore from "../store";
import useThemeStore from "../store/themeStore.js";

function ClassroomGrade() {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState("classrooms");
    const [error, setError] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const { classroomCode } = useParams();
    const { user, signOut } = useStore(s => s);
      // 🌙 get theme + toggle function
  const { theme, toggleTheme } = useThemeStore();

     // 🌓 Apply theme to document root
      useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
      }, [theme]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        signOut();
        navigate("/");
    };

    /*
        API ENDPOINTS TO USE:

        1. For fetching all lessons in this classroom with the student list:
            
            api.get("classrooms/:cr_id/lessons/students")
            
            - :cr_id = classroom id/classroom code
            
            Expected response data will be an array of lesson objects, each with:
            - crcl_cl_id, lesson_id, lesson_title, lesson_credit
            - students: array of student objects with:
                - stucourse_id, stu_user_id, stu_user_fname, stu_user_lname, stu_user_email
                - attendance, completion, grade
    
        2. For updating all students' grades/completions/attendance for a lesson in this classroom:
            api.put("classrooms/:cr_id/lessons/:crcl_cl_id/students", studentData)

            - :cr_id = classroom id/classroom code
            - :crcl_cl_id: can be obtained from lesson object in the lessons array fetched from the first endpoint above

            Expect in studentData:
            - array of student objects with:
                - stucourse_id (can be obtained from student object in classroom.students array),
                - attendance, 
                - grade, 
                - completion
                
            e.g. studentData = [{ stucourse_id, attendance, grade, completion }, ...]

    */

    useEffect(() => {
        const fetchLessonsWithStudents = async () => {
            try {
                const { data: res } = await api.get(`classrooms/${classroomCode}/lessons/students`);
                if (!res.success) {
                    console.error("Error fetching lessons:", res.message);
                    setError("Lessons not found");
                    setLessons([]);
                    setActiveLesson(null);
                    return;
                }
                console.log("Setting lessons:", res.data);
                setLessons(res.data);
                console.log("Setting activeLesson:", res.data?.length > 0? res.data[0].crcl_cl_id : null);
                setActiveLesson(res.data?.length > 0? res.data[0].crcl_cl_id : null);

            } catch (err) {
                console.error("Error fetching lessons:", err);
                setError("Lessons not found");
                setLessons([]);
                setActiveLesson(null);
            } finally {
                setLoading(false);
            }
        };
        fetchLessonsWithStudents();
    }, [classroomCode]);

    useEffect(() => {
        console.log("Lessons updated:", lessons);
    }, [lessons]);

    useEffect(() => {
        console.log("Active lesson updated:", activeLesson);
    }, [activeLesson]);


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

    if (error || lessons.length === 0) {
        return (
            <div className="flex">
                <div className="main-content">
                    <div className="empty">
                        <h2>Empty</h2>
                        <p>{error || "No lessons in classroom yet"}</p>
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
                                       <div className="theme-toggle">
            <label className="switch">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={toggleTheme}
              />
              <span className="slider"></span>
            </label>
            <span className="theme-label">{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
          </div>
                </div>
                {/** Lesson Tabs */}
                <div className="lesson-tabs">
                    {lessons.map((lesson) => (
                        <button
                            key={lesson.crcl_cl_id}
                            className={activeLesson === lesson.crcl_cl_id ? "active" : ""}
                            onClick={() => setActiveLesson(lesson.crcl_cl_id)}
                        >
                            {lesson.lesson_title}
                        </button>
                    ))}
                </div>
                {lessons.filter(l => l.crcl_cl_id === activeLesson).map(lesson =>
                    <div key={lesson.crcl_cl_id} className="lesson-container">
                        <h2>{lesson.lesson_title} - Students</h2>
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Attendance</th>
                                    <th>Completion</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lesson.students && lesson.students.length > 0 && lesson.students.map((stu, idx) => {
                                    // Check if student has existing grade and completion is pass
                                    const hasExistingGrade = stu.grade && stu.grade !== "" && stu.grade !== 0;
                                    const isCompleted = stu.completion === true;
                                    const isDisabled = hasExistingGrade && isCompleted;
                                    
                                    return (
                                        <tr key={stu.stucourse_id || idx} className={isDisabled ? "disabled-row" : ""}>
                                            <td>{stu.stu_user_fname} {stu.stu_user_lname}</td>
                                            <td>{stu.stu_user_email}</td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={stu.attendance || false}
                                                    onChange={e => {
                                                        const updated = [...lessons];
                                                        const lessonIdx = updated.findIndex(l => l.crcl_cl_id === lesson.crcl_cl_id);
                                                        updated[lessonIdx].students[idx].attendance = e.target.checked;
                                                        setLessons(updated);
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={stu.completion || false}
                                                    disabled={isDisabled}
                                                    onChange={e => {
                                                        const updated = [...lessons];
                                                        const lessonIdx = updated.findIndex(l => l.crcl_cl_id === lesson.crcl_cl_id);
                                                        updated[lessonIdx].students[idx].completion = e.target.checked;
                                                        setLessons(updated);
                                                    }}
                                                />
                                                {isDisabled && <span className="disabled-indicator">✓</span>}
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={stu.grade || ""}
                                                    placeholder="e.g. 80%"
                                                    disabled={isDisabled}
                                                    onChange={e => {
                                                        const updated = [...lessons];
                                                        const lessonIdx = updated.findIndex(l => l.crcl_cl_id === lesson.crcl_cl_id);
                                                        updated[lessonIdx].students[idx].grade = e.target.value;
                                                        setLessons(updated);
                                                    }}
                                                />
                                                {isDisabled && <span className="disabled-indicator">✓</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <button
                            className="save-btn"
                            onClick={async () => {
                                const invalidStudents = lessons.flatMap(lesson =>
                                    lesson.students.filter(stu =>
                                        stu.grade === "" || stu.grade < 0 || stu.grade > 100
                                    )
                                );
                                if (invalidStudents.length > 0) {
                                    alert("Please ensure all grades are between 0 and 100 before saving.");
                                    return;
                                }
                                try {
                                    const studentData = lesson.students.map(stu => ({
                                        stu_user_id: stu.stu_user_id,
                                        attendance: stu.attendance || false,
                                        grade: stu.grade || 0,
                                        completion: stu.completion || false,
                                    }));
                                    await api.put(`classrooms/${classroomCode}/lessons/${lesson.lesson_id}/students`, studentData);
                                    alert("Grades updated successfully!");
                                } catch (err) {
                                    console.error("Error updating student marks:", err);
                                    alert("Failed to update student marks. Please try again.");
                                }
                            }}
                        >
                            Save Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ClassroomGrade;
