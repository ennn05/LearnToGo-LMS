import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CreateClassroom.css";
import api from "../libs/apiCalls";
import useStore from "../store";


function EditClassroom() {
  const { classroomCode } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useStore((state) => state);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // fetch classroom details
  const fetchClassroomDetails = async () => {
    try {
      const { data: res } = await api.get(`classrooms/${classroomCode}`);
      if (!res.success) throw new Error(res.message);
      const cr = res.data;

      setClassroomData({
        classroomId: cr.cr_id,
        startDate: cr.cr_start_date,
        duration: cr.cr_duration,
        createdDate: cr.cr_date_created,
        updatedDate: cr.cr_date_updated,
        author: cr.cr_creator,
        supervisor: cr.supervisor_id,
        status: cr.cr_status,
      });

      setAssignedCourse(
        cr.course_code ? { course_code: cr.course_code, course_title: cr.course_title } : null
      );
      setAssignedLessons(cr.lessons || []);
      setAssignedStudents(cr.students || []);
    } catch (err) {
      console.error("Error fetching classroom:", err);
      setError("Failed to fetch classroom");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassroomDetails();
  }, [classroomCode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClassroomData((prev) => ({ ...prev, [name]: value }));
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
        lessons: assignedLessons.map((l) => l.lesson_id),
        students: assignedStudents.map((s) => s.stucourse_id),
      };

      const { data: res } = await api.put(`classrooms/${classroomCode}`, updatedClassroom);
      if (!res.success) throw new Error(res.message);

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

  const filteredLessons = availableLessons.filter(
    (lesson) =>
      lesson.lesson_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.lesson_desc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading classroom...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="profile">
          <div className="avatar"></div>
          <div className="info">
            <div className="name">{user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}</div>
            <div className="role">{user?.user_role ?? "Instructor"}</div>
          </div>
        </div>
        <nav className="nav-menu">
          <button onClick={() => navigate("/courses")}>Courses</button>
          <button onClick={() => navigate("/lessons")}>Lessons</button>
          <button className="active" onClick={() => navigate("/classrooms")}>Classrooms</button>
          <button onClick={() => navigate("/students")}>Students</button>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <h1>Edit Classroom</h1>
        </div>

        <div className="create-classroom-container">
          {/* Classroom Info */}
          <div className="classroom-form">
            <div className="form-row">
              <div className="form-group">
                <label>Classroom Code:</label>
                <input type="text" name="classroomId" value={classroomData.classroomId} readOnly />
              </div>
              <div className="form-group">
                <label>Start Date:</label>
                <input type="date" name="startDate" value={classroomData.startDate} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Duration (weeks):</label>
                <input type="number" name="duration" value={classroomData.duration} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* Lessons */}
          <div className="lesson-section">
            <h3>Lessons Assigned</h3>
            <div className="assigned-lessons-container">
              {assignedLessons.length === 0 ? (
                <p>No lessons assigned yet.</p>
              ) : (
                assignedLessons.map((lesson) => (
                  <div key={lesson.lesson_id} className="assigned-lesson-card">
                    <div className="lesson-info">
                      <h4>{lesson.lesson_title}</h4>
                      <p>{lesson.lesson_desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <h3>Available Lessons</h3>
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="available-lessons-grid">
              {filteredLessons.map((lesson) => (
                <div key={lesson.lesson_id} className="available-lesson-card">
                  <div className="lesson-content">
                    <h4>{lesson.lesson_title}</h4>
                    <p>{lesson.lesson_desc}</p>
                  </div>
                  <button onClick={() => setAssignedLessons([...assignedLessons, lesson])}>+</button>
                </div>
              ))}
            </div>
          </div>

          {/* Save / Cancel */}
          <div className="save-section">
            <button className="btn-save" onClick={handleUpdateClassroom}>Save Changes</button>
            <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditClassroom;
