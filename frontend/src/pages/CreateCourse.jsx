import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateCourse.css"; 

function CreateCourse() {
  const [activePage, setActivePage] = useState("courses");
  const [user, setUser] = useState(null);
  const [courseData, setCourseData] = useState({
    courseCode: "",
    courseTitle: "",
    totalCredits: "",
    status: "draft"
  });
  const [assignedLessons, setAssignedLessons] = useState([]);
  const [availableLessons, setAvailableLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch available lessons
  const fetchLessons = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/lessons");
      if (!response.ok) {
        console.error("API error:", response.status, response.statusText);
        setAvailableLessons([]);
        return;
      }
      const data = await response.json();
      console.log("Lessons fetched:", data);
      setAvailableLessons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setAvailableLessons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("=== DEBUG: CreateCourse useEffect triggered ===");
    
    const storedUser = localStorage.getItem("user");
    console.log("Raw stored user from localStorage:", storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed user object:", parsedUser);
        console.log("User properties:", {
          user_id: parsedUser.user_id,
          instr_user_id: parsedUser.instr_user_id,
          user_fname: parsedUser.user_fname,
          user_lname: parsedUser.user_lname,
          role: parsedUser.role || parsedUser.user_role
        });
        
        // Fix: If user doesn't have instr_user_id but has user_id and is an instructor,
        // use user_id as the instructor ID
        if (!parsedUser.instr_user_id && parsedUser.user_id && 
            (parsedUser.user_role === "instructor" || parsedUser.role === "instructor")) {
          console.log("Setting instr_user_id to user_id:", parsedUser.user_id);
          parsedUser.instr_user_id = parsedUser.user_id;
        }
        
        setUser(parsedUser);
        console.log("User state set with instr_user_id:", parsedUser.instr_user_id);
      } catch (parseError) {
        console.error("Error parsing stored user:", parseError);
        console.error("Invalid JSON in localStorage:", storedUser);
      }
    } else {
      console.warn("No user found in localStorage");
    }
    
    fetchLessons();
  }, []);

  const buildCoursePayload = (statusOverride = null) => {
    console.log("=== DEBUG: Building course payload ===");
    console.log("Current user state:", user);
    console.log("User instr_user_id:", user?.instr_user_id);
    console.log("Course data:", courseData);
    
    const payload = {
      code: courseData.courseCode,
      title: courseData.courseTitle,
      total_credit: parseInt(courseData.totalCredits),
      date_created: new Date().toISOString(),
      date_updated: new Date().toISOString(),
      creator: user?.instr_user_id || user?.user_id || null, // Fallback to user_id
      status: statusOverride || courseData.status || "draft",
      lessons: assignedLessons.map(l => l.lesson_id)
    };
    
    console.log("Final payload:", payload);
    console.log("Creator field value:", payload.creator);
    
    if (!payload.creator) {
      console.error("⚠️ WARNING: Creator is null/undefined!");
      console.error("This will cause database constraint violation");
    }
    
    return payload;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (newStatus) => {
    setCourseData(prev => ({
      ...prev,
      status: newStatus
    }));
  };

  const handlePublishCourse = async () => {
    console.log("=== DEBUG: Publishing course ===");
    try {
      if (!courseData.courseCode || !courseData.courseTitle || !courseData.totalCredits) {
        alert("Please fill in all required fields.");
        return;
      }

      // Check if we have instructor ID before proceeding
      console.log("Checking user before publish:", user);
      const instructorId = user?.instr_user_id || user?.user_id;
      if (!instructorId) {
        console.error("No instructor ID found!");
        alert("Error: Instructor information not loaded. Please refresh the page and try again.");
        return;
      }

      const courseToSave = buildCoursePayload("published"); 
      console.log("Sending course data to server:", courseToSave);

      const response = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseToSave)
      });

      console.log("Server response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(errorData.message || "Failed to publish course");
      }

      const responseData = await response.json();
      console.log("Course published successfully:", responseData);
      alert("Course published successfully!");
      navigate("/courses");
    } catch (error) {
      console.error("Error publishing course:", error);
      alert(error.message);
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
    console.log("=== DEBUG: Saving course ===");
    try {
      if (!courseData.courseCode || !courseData.courseTitle || !courseData.totalCredits) {
        alert("Please fill in all required fields.");
        return;
      }

      // Check if we have instructor ID before proceeding
      console.log("Checking user before save:", user);
      const instructorId = user?.instr_user_id || user?.user_id;
      if (!instructorId) {
        console.error("No instructor ID found!");
        alert("Error: Instructor information not loaded. Please refresh the page and try again.");
        return;
      }

      const courseToSave = buildCoursePayload("draft"); 
      console.log("Sending course data to server:", courseToSave);

      const response = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseToSave)
      });

      console.log("Server response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(errorData.message || "Failed to save course");
      }

      const responseData = await response.json();
      console.log("Course saved successfully:", responseData);
      alert("Course saved as draft!");
      navigate("/courses");
    } catch (error) {
      console.error("Error saving course:", error);
      alert(error.message);
    }
  };

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
            <div className="role">Instructor</div>
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
            onClick={() => setActivePage("students")}
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
              <button 
                className="btn-publish" 
                onClick={handlePublishCourse}
              >
                Publish
              </button>
              <button 
                className="btn-archive" 
                onClick={() => handleStatusChange('archived')}
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
                <input
                  type="number"
                  name="totalCredits"
                  value={courseData.totalCredits}
                  onChange={handleInputChange}
                  placeholder="e.g., 3"
                />
              </div>
              <div className="form-group">
                <label>Created By:</label>
                <span className="readonly-field">
                  {user ? (user.instr_user_id || user.user_id) : "Unknown"}
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
                        className={`add-btn ${assignedLessons.find(l => l.lesson_id === lesson.lesson_id) ? 'added' : ''}`}
                        onClick={() => addLessonToCourse(lesson)}
                        disabled={assignedLessons.find(l => l.lesson_id === lesson.lesson_id)}
                      >
                        {assignedLessons.find(l => l.lesson_id === lesson.lesson_id) ? '✓' : '+'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="save-section">
            <button className="btn-save" onClick={handleSaveCourse}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCourse;