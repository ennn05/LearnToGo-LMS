import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CreateClassroom.css"; 
import api from "../libs/apiCalls";
import useStore from "../store";

function EditClassroom() {
    const { classroomId } = useParams(); // get classroom id from url
    const navigate = useNavigate();

    const { user, signOut } = useStore((state) => state);

    const [activePage, setActivePage] = useState("classrooms");

    const [classroomData, setClassroomData] = useState({
        classroomId: "",
        startDate: "",
        duration: "",
        createdDate: "",
        updatedDate: "",
        author: "",
        supervisor: "",
        status: "draft",
    });

    const [assignedCourse, setAssignedCourse] = useState(null);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [assignedLessons, setAssignedLessons] = useState([]);
    const [availableLessons, setAvailableLessons] = useState([]);
    const [assignedStudents, setAssignedStudents] = useState([]);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [availableSupervisors, setAvailableSupervisors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // ✅ Fetch classroom details for editing
    const fetchClassroomDetails = async () => {
        try {
            const { data: response } = await api.get(`classrooms/${classroomId}`);
            if (!response.success) throw new Error(response.message);

            const classroom = response.data;
            setClassroomData({
                classroomId: classroom.cr_id,
                startDate: classroom.cr_start_date,
                duration: classroom.cr_duration,
                createdDate: classroom.cr_date_created,
                updatedDate: classroom.cr_date_updated,
                author: classroom.cr_creator,
                supervisor: classroom.supervisor_id,
                status: classroom.cr_status,
            });

            // pre-fill course
            setAssignedCourse({
                course_code: classroom.course_code,
                course_title: classroom.course_title
            });

            // pre-fill lessons
            setAssignedLessons(classroom.lessons || []);

            // pre-fill students
            setAssignedStudents(classroom.students || []);

        } catch (error) {
            console.error("Error fetching classroom:", error);
            alert("Failed to load classroom details!");
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/courses/published`);
            const data = await response.json();
            setAvailableCourses(data.data || []);
        } catch (err) {
            console.error("Error fetching courses:", err);
        }
    };

    const fetchLessonsForCourse = async course_code => {
        try {
            const response = await fetch(`http://localhost:5000/api/lessons/published`);
            const data = await response.json();
            const match = data.data.find(item => item.cl_course_code === course_code);
            setAvailableLessons(match ? match.lessons : []);
        } catch (err) {
            console.error("Error fetching lessons:", err);
        }
    };

    const fetchStudentsForCourse = async course_code => {
        try {
            const response = await fetch(`http://localhost:5000/api/courses/enrolled-students/${course_code}`);
            const data = await response.json();
            const match = data.data.find(item => item.course_code === course_code);
            setAvailableStudents(match ? match.students : []);
        } catch (err) {
            console.error("Error fetching students:", err);
        }
    };

    const fetchAvailableSupervisors = async () => {
        try {
            const { data: response } = await api.get("users/instructors");
            if (response.success) setAvailableSupervisors(response.data);
        } catch (err) {
            console.error("Error fetching supervisors:", err);
        }
    };

    useEffect(() => {
        fetchClassroomDetails();
        fetchCourses();
        fetchAvailableSupervisors();
    }, [classroomId]);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setClassroomData(prev => ({ ...prev, [name]: value }));
    };

    const handleCourseSelect = course => {
        setAssignedCourse(course);
        fetchLessonsForCourse(course.course_code);
        fetchStudentsForCourse(course.course_code);
    };

    const handleUpdateClassroom = async () => {
        try {
            const updatedClassroom = {
                cr_id: classroomData.classroomId,
                cr_start_date: classroomData.startDate,
                cr_duration: classroomData.duration,
                cr_status: classroomData.status,
                course_code: assignedCourse?.course_code,
                cr_creator: user.user_id,
                supervisor_id: classroomData.supervisor,
                lessons: assignedLessons.map(l => l.cl_id),
                students: assignedStudents.map(s => s.stucourse_id)
            };

            console.log("Updating classroom:", updatedClassroom);

            const { data: response } = await api.put(`classrooms/${classroomId}`, updatedClassroom);
            if (!response.success) throw new Error(response.message);

            alert("Classroom updated successfully!");
            navigate("/classrooms");
        } catch (error) {
            console.error("Error updating classroom:", error);
            alert("Failed to update classroom!");
        }
    };

    const handleCancel = () => navigate("/classrooms");

    const handleLogout = () => {
        localStorage.removeItem("user");
        signOut();
        navigate("/");
    };

    const filteredLessons = Array.isArray(availableLessons)
        ? availableLessons.filter(
              lesson =>
                  lesson.lesson_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  lesson.lesson_desc?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    return (
        <div className="flex">
            {/** Sidebar same as CreateClassroom */}
            <div className="sidebar">
                <div className="profile">
                    <div className="avatar"></div>
                    <div className="info">
                        <div className="name">
                            {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}
                        </div>
                        <div className="role">{user?.user_role ?? "Instructor"}</div>
                    </div>
                </div>
                <nav className="nav-menu">
                    <button onClick={() => navigate("/courses")}>Courses</button>
                    <button onClick={() => navigate("/lessons")}>Lessons</button>
                    <button className="active" onClick={() => navigate("/classrooms")}>Classrooms</button>
                    <button onClick={() => navigate("/students")}>Students</button>
                    <button onClick={() => setActivePage("reports")}>Reports & Statistics</button>
                    <button className="logout-btn" onClick={handleLogout}>Log Out</button>
                </nav>
            </div>

            {/** Main Content */}
            <div className="main-content">
                <div className="topbar">
                    <h1>Edit Classroom</h1>
                </div>
                <div className="create-classroom-container">
                    {/** Similar UI as CreateClassroom */}
                    <div className="classroom-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Classroom Code:</label>
                                <input
                                    type="text"
                                    name="classroomId"
                                    value={classroomData.classroomId}
                                    onChange={handleInputChange}
                                    disabled // code shouldn't change usually
                                />
                            </div>
                            <div className="form-group">
                                <label>Date Created:</label>
                                <span className="readonly-field">{classroomData.createdDate}</span>
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
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Updated:</label>
                                <span className="readonly-field">{classroomData.updatedDate}</span>
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
                                />
                                <label>week(s)</label>
                            </div>
                            <div className="form-group">
                                <label>Created By:</label>
                                <span className="readonly-field">{classroomData.author}</span>
                            </div>
                        </div>
                    </div>

                    {/** Supervisor & Course Section */}
                    <div className="supervisor-course-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Supervisor:</label>
                                <select
                                    name="supervisor"
                                    value={classroomData.supervisor}
                                    onChange={handleInputChange}
                                >
                                    {availableSupervisors.map(supervisor => (
                                        <option key={supervisor.user_id} value={supervisor.user_id}>
                                            {supervisor.user_fname} {supervisor.user_lname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Assign Course:</label>
                                <select
                                    value={assignedCourse?.course_code || ""}
                                    onChange={(e) => {
                                        const selected = availableCourses.find(c => c.course_code === e.target.value);
                                        handleCourseSelect(selected);
                                    }}
                                >
                                    <option value="">-- Select a course --</option>
                                    {availableCourses.map(course => (
                                        <option key={course.course_code} value={course.course_code}>
                                            {course.course_code} - {course.course_title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/** Lessons + Students sections same as CreateClassroom */}

                    {/** Save/Cancel */}
                    <div className="save-section">
                        <button className="btn-save" onClick={handleUpdateClassroom}>Update</button>
                        <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditClassroom;
