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
