import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateCourse.css"; // Stylesheet for page
import useStore from "../store";
import api from "../libs/apiCalls";
import useThemeStore from "../store/themeStore.js";

function CreateCourse() {
  // State for sidebar navigation
  const [activePage] = useState("courses");

  // User information (fetched from localStorage or mock user)
  const {user, signOut} = useStore((state) => state);

  // Course data with default status as "draft"
  const [courseData, setCourseData] = useState({
    courseCode: "",
    courseTitle: "",
    totalCredits: 0,
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
      const {data: res} = await api.get("lessons");
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
    } finally {
      setLoading(false);
    }
  };
  
    // 🌙 get theme + toggle function
  const { theme, toggleTheme } = useThemeStore();

    // 🌓 Apply theme to document root
    useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

  // Load user and lessons on mount
  useEffect(() => {
    // const storedUser = localStorage.getItem("user");
    // if (storedUser) {
    //   setUser(JSON.parse(storedUser));
    // } else {
    //   // Mock user for testing
    //   setUser({
    //     user_fname: "Test",
    //     user_lname: "User",
    //     user_email: "test@example.com",
    //     user_role: "Instructor",
    //   });
    // }
    fetchLessons();
  }, []);

  // Update course data when inputs change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value,
      totalCredits: assignedLessons.reduce((sum, lesson) => Number(lesson.lesson_credit || 0) + sum, 0)
    }));
  };

  // Change course status (draft, published, archived)
  const handleStatusChange = (newStatus) => {
    setCourseData(prev => ({
      ...prev,
      status: newStatus
    }));
  };

  // Add a lesson to course (avoid duplicates)
  const addLessonToCourse = (lesson) => {
    if (!assignedLessons.find(l => l.lesson_id === lesson.lesson_id)) {
      const updatedLessons = [...assignedLessons, lesson];
      setAssignedLessons(updatedLessons);
      setCourseData(prev => ({
      ...prev,
      totalCredits: updatedLessons.reduce((sum, lesson) => Number(lesson.lesson_credit || 0) + sum, 0)
    }));
      
    }
  };

  // Remove a lesson from course
  const removeLessonFromCourse = (lessonId) => {
    const updatedLessons = assignedLessons.filter(l => l.lesson_id !== lessonId);
    setAssignedLessons(updatedLessons);
    setCourseData(prev => ({
      ...prev,
      totalCredits: updatedLessons.reduce(
        (sum, l) => sum + Number(l.lesson_credit || 0),
        0
      )
    }));
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

      const {data: res} = await api.post("courses", courseToSave);

      if (!res.success) {
        throw new Error(res.message || "Failed to save course");
      }
      else {
        alert("Course saved successfully!");
      }

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
    signOut();
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
            onClick={() => navigate("classrooms")}
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
            onClick={() => navigate("reports")}
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

        <div className="create-course-container">
          {/* Course Header with Status and Actions */}
          <div className="course-header">
            <div className="course-status">
              <span className={`status-badge ${courseData.status}`}>
                {courseData.status.charAt(0).toUpperCase() + courseData.status.slice(1)}
              </span>
            </div>
            <div className="course-actions">
              {courseData.status !== "published" ? (
                <button className="btn-publish" onClick={() => handleStatusChange("published")}>
                  Publish
                </button>
              ) : ("")}
              {courseData.status !== "archived" ? (
                <button 
                  className="btn-archive" 
                  onClick={() => handleStatusChange("archived")}
                >
                  Archive
                </button>
                ) : ("")}
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
                        <p>{lesson.lesson_credit} credits</p>
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
                        <p>{lesson.lesson_credit} credits</p>
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
