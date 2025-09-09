import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateCourse.css"; // Stylesheet for page

function CreateCourse() {
  // State for sidebar navigation
  const [activePage, setActivePage] = useState("courses");

  // User information (fetched from localStorage or mock user)
  const [user, setUser] = useState(null);

  // Course data with default status as "draft"
  const [courseData, setCourseData] = useState({
    courseCode: "",
    courseTitle: "",
    totalCredits: "",
    status: "draft"
  });

  // Lessons management
  const [assignedLessons, setAssignedLessons] = useState([]);
  const [availableLessons, setAvailableLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch published lessons from backend
  const fetchLessons = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/lessons");
      if (!response.ok) {
        console.error("API error:", response.status, response.statusText);
        setAvailableLessons([]);
        return;
      }
      const data = await response.json();
      setAvailableLessons(
        data.data.filter(lesson => lesson.lesson_status === "published")
      );
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setAvailableLessons([]);
    } finally {
      setLoading(false);
    }
  };

  // Load user and lessons on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Mock user for testing
      setUser({
        user_fname: "Test",
        user_lname: "User",
        user_email: "test@example.com",
        user_role: "Instructor",
      });
    }
    fetchLessons();
  }, []);

  // Update course data when inputs change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value,
      totalCredits: assignedLessons.reduce((sum, lesson) => lesson.lesson_credit + sum, 0)
    }));
  };

  // Change course status (draft, published, archived)
  const handleStatusChange = (newStatus) => {
    setCourseData(prev => ({
      ...prev,
      status: newStatus
    }));
  };

  // Publish course (validate required fields then save with status "published")
  const handlePublishCourse = async () => {
    try {
      if (!courseData.courseCode || !courseData.courseTitle || !courseData.totalCredits) {
        alert("Please fill in all required fields (Course Code, Title, and Credits) before publishing.");
        return;
      }

      const publishedCourseData = { ...courseData, status: "published" };
      setCourseData(publishedCourseData);

      const courseToSave = {
        course_code: publishedCourseData.courseCode,
        course_title: publishedCourseData.courseTitle,
        total_credits: parseInt(publishedCourseData.totalCredits),
        status: "published",
        assignedLessons: assignedLessons.map(l => l.lesson_id)
      };

      console.log("Publishing course:", courseToSave);
      alert("Course published successfully!");
      navigate("/courses");
    } catch (error) {
      console.error("Error publishing course:", error);
      alert("Failed to publish course. Please try again.");
    }
  };

  // Add a lesson to course (avoid duplicates)
  const addLessonToCourse = (lesson) => {
    if (!assignedLessons.find(l => l.lesson_id === lesson.lesson_id)) {
      setAssignedLessons(prev => [...prev, lesson]);
    }
  };

  // Remove a lesson from course
  const removeLessonFromCourse = (lessonId) => {
    setAssignedLessons(prev => prev.filter(l => l.lesson_id !== lessonId));
  };

  // Filter lessons based on search input
  const filteredLessons = Array.isArray(availableLessons)
    ? availableLessons.filter(
        (lesson) =>
          lesson.lesson_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lesson.lesson_desc?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Save course as draft
  const handleSaveCourse = async () => {
    try {
      if (!courseData.courseCode || !courseData.courseTitle) {
        alert("Please fill in all required fields (Course Code, Title, and Credits) before saving.");
        return;
      }

      const courseToSave = {
        code: courseData.courseCode,
        title: courseData.courseTitle,
        status: courseData.status,
        creator: user.user_id,
        credit: courseData.totalCredits,
        lessons: assignedLessons.map(l => l.lesson_id)
      };

      const response = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseToSave)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save course");
      }

      alert("Course saved successfully!");
      navigate("/courses");
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course. Please try again.");
    }
  };

  // Cancel course creation and return to courses page
  const handleCancel = () => {
    navigate("/courses");
  };

  // Log out user and return to login page
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const currentDate = new Date().toLocaleDateString();

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
            <div className="role">{user?.user_role ?? "Instructor"}</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <button
            className={activePage === "courses" ? "active" : ""}
            onClick={() => navigate("/courses")}
          >
            Courses
          </button>
          <button
            className={activePage === "lessons" ? "active" : ""}
            onClick={() => navigate("/lessons")}
          >
            Lessons
          </button>
          <button
            className={activePage === "classrooms" ? "active" : ""}
            onClick={() => setActivePage("classrooms")}
          >
            Classrooms
          </button>
          <button
            className={activePage === "students" ? "active" : ""}
            onClick={() => navigate("/students")}
          >
            Students
          </button>
          <button
            className={activePage === "reports" ? "active" : ""}
            onClick={() => setActivePage("reports")}
          >
            Reports & Statistics
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <h1>New Course</h1>
        </div>

        <div className="create-course-container">
          {/* Course Header with Status and Actions */}
          <div className="course-header">
            <div className="course-status">
              <span className={`status-badge ${courseData.status}`}>
                {courseData.status.charAt(0).toUpperCase() + courseData.status.slice(1)}
              </span>
            </div>
            <div className="course-actions">
              <button className="btn-publish" onClick={handlePublishCourse}>
                Publish
              </button>
              <button 
                className="btn-archive" 
                onClick={() => handleStatusChange("archived")}
              >
                Archive
              </button>
            </div>
          </div>

          {/* Course Information Form */}
          <div className="course-form">
            <div className="form-row">
              <div className="form-group">
                <label>Course Code:</label>
                <input
                  type="text"
                  name="courseCode"
                  value={courseData.courseCode}
                  onChange={handleInputChange}
                  placeholder="e.g., C2001"
                />
              </div>
              <div className="form-group">
                <label>Date Created:</label>
                <span className="readonly-field">{currentDate}</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Course Title:</label>
                <input
                  type="text"
                  name="courseTitle"
                  value={courseData.courseTitle}
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
                <span className="readonly-field">{courseData.totalCredits}</span>
              </div>
              <div className="form-group">
                <label>Created By:</label>
                <span className="readonly-field">
                  {user ? `${user.user_fname} ${user.user_lname}` : "Loading..."}
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

export default CreateCourse;
