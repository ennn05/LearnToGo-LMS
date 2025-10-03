import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CreateClassroom.css"; // reuse same CSS as Create
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

  // ---- Fetch classroom details ----
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

      if (cr.course_code) {
        fetchLessonsForCourse(cr.course_code);
        fetchStudentsForCourse(cr.course_code);
      }
    } catch (err) {
      console.error("Error fetching classroom:", err);
      setError("Failed to fetch classroom");
    } finally {
      setLoading(false);
    }
  };

  // ---- Fetch helpers ----
  const fetchCourses = async () => {
    try {
      const { data: res } = await api.get("courses/published");
      if (res.success) setAvailableCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchLessonsForCourse = async (course_code) => {
    try {
      const { data: res } = await api.get("lessons/published");
      if (res.success) {
        const match = res.data.find((item) => item.cl_course_code === course_code);
        const lessons = match ? match.lessons : [];
        setAvailableLessons(lessons);
      }
    } catch (err) {
      console.error("Error fetching lessons:", err);
    }
  };

  const fetchStudentsForCourse = async (course_code) => {
    try {
      const { data: res } = await api.get(`courses/enrolled-students/${course_code}`);
      if (res.success) {
        const match = res.data.find((item) => item.course_code === course_code);
        setAvailableStudents(match ? match.students : []);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchAvailableSupervisors = async () => {
    try {
      const { data: res } = await api.get("users/instructors");
      if (res.success) setAvailableSupervisors(res.data);
    } catch (err) {
      console.error("Error fetching supervisors:", err);
    }
  };

  useEffect(() => {
    fetchClassroomDetails();
    fetchCourses();
    fetchAvailableSupervisors();
  }, [classroomCode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClassroomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (newStatus) => {
    setClassroomData((prev) => ({ ...prev, status: newStatus }));
  };

  const handleCourseSelect = (course) => {
    setAssignedCourse(course);
    setAssignedLessons([]);
    setAssignedStudents([]);
    fetchLessonsForCourse(course.course_code);
    fetchStudentsForCourse(course.course_code);
  };

  const addLessonToClassroom = (lesson) => {
    if (!assignedLessons.find((l) => l.lesson_id === lesson.lesson_id)) {
      setAssignedLessons((prev) => [...prev, lesson]);
    }
  };

  const removeLessonFromClassroom = (lesson_id) => {
    setAssignedLessons((prev) => prev.filter((l) => l.lesson_id !== lesson_id));
  };

  const toggleStudentSelection = (student) => {
    const exists = assignedStudents.find((s) => s.stu_user_id === student.stu_user_id);
    if (exists) {
      setAssignedStudents((prev) => prev.filter((s) => s.stu_user_id !== student.stu_user_id));
    } else {
      setAssignedStudents((prev) => [...prev, student]);
    }
  };

  const handleUpdateClassroom = async () => {
  const today = new Date().toISOString().split("T")[0];

  const updatedClassroom = {
    cr_start_date: classroomData.startDate,
    cr_duration: classroomData.duration,
    cr_status: classroomData.status,
    course_code: assignedCourse?.course_code || null,
    supervisor_id: classroomData.supervisor,
    cr_date_updated: today,
  };

  try {
    console.log("Sending update payload:", updatedClassroom);

    const response = await api.put(`/classrooms/${classroomData.classroomId}`, updatedClassroom);

    console.log("Update success:", response.data);
    alert("Classroom updated successfully!");
  } catch (error) {
    console.error("Error updating classroom:", error);
    alert("Failed to update classroom.");
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
          {/* Status & Actions */}
          <div className="classroom-header">
            <div className="classroom-status">
              <span className={`status-badge ${classroomData.status}`}>
                {classroomData.status.charAt(0).toUpperCase() + classroomData.status.slice(1)}
              </span>
            </div>
            <div className="classroom-actions">
              <button className="btn-publish" onClick={() => handleStatusChange("published")}>Publish</button>
              <button className="btn-archive" onClick={() => handleStatusChange("archived")}>Archive</button>
            </div>
          </div>

          {/* Classroom Form */}
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

          {/* Supervisor & Course */}
          <div className="supervisor-course-section">
            <div className="form-row">
              <div className="form-group">
                <label>Supervisor:</label>
                <select
                  name="supervisor"
                  value={classroomData.supervisor}
                  onChange={handleInputChange}
                >
                  {availableSupervisors.map((s) => (
                    <option key={s.user_id} value={s.user_id}>
                      {s.user_fname} {s.user_lname}
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
                    const selected = availableCourses.find((c) => c.course_code === e.target.value);
                    handleCourseSelect(selected);
                  }}
                >
                  <option value="">-- Select a course --</option>
                  {availableCourses.map((c) => (
                    <option key={c.course_code} value={c.course_code}>
                      {c.course_code} - {c.course_title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lessons Section */}
          <div className="lesson-section">
            <div className="lessons-assigned">
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
                      <div className="lesson-actions">
                        <span className="check-icon">✓</span>
                        <button className="remove-btn" onClick={() => removeLessonFromClassroom(lesson.lesson_id)}>×</button>
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
                />
              </div>
              <div className="available-lessons-grid">
                {filteredLessons.map((lesson) => (
                  <div key={lesson.lesson_id} className="available-lesson-card">
                    <div className="lesson-content">
                      <h4>{lesson.lesson_title}</h4>
                      <p>{lesson.lesson_desc}</p>
                    </div>
                    <button
                      className={`add-btn ${assignedLessons.find((l) => l.lesson_id === lesson.lesson_id) ? "added" : ""}`}
                      onClick={() => addLessonToClassroom(lesson)}
                      disabled={assignedLessons.find((l) => l.lesson_id === lesson.lesson_id)}
                    >
                      {assignedLessons.find((l) => l.lesson_id === lesson.lesson_id) ? "✓" : "+"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Students Section */}
          <div className="students-section">
            <h3>Assign Students</h3>
            {availableStudents.length === 0 ? (
              <p>No students enrolled in this course yet.</p>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {availableStudents.map((student) => (
                    <tr key={student.user_id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={assignedStudents.some((s) => s.stu_user_id === student.stu_user_id)}
                          onChange={() => toggleStudentSelection(student)}
                        />
                      </td>
                      <td>{student.stu_user_id}</td>
                      <td>{student.user_fname} {student.user_lname}</td>
                      <td>{student.user_email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
