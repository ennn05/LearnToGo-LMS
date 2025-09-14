import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Courses.css";

function StudentCourses() {
  const [studentCourses, setStudentCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my"); // 'my' or 'available'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentCourses = async () => {
      try {
        const { data: response } = await api.get("courses");
        setStudentCourses(response.data || []);
      } catch (error) {
        setStudentCourses([]);
      }
    };
    const fetchAvailableCourses = async () => {
      try {
        const { data: response } = await api.get("courses/available");
        setAvailableCourses(response.data || []);
      } catch (error) {
        setAvailableCourses([]);
      }
    };
    setLoading(true);
    Promise.all([
      fetchStudentCourses(),
      fetchAvailableCourses(),
    ]).finally(() => setLoading(false));
  }, []);

  const handleCourseClick = (courseCode) => {
    navigate(`/courses/${courseCode}`);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="profile">
          <div className="avatar"></div>
          <div className="info">
            <div className="name">Student</div>
            <div className="role">Student</div>
          </div>
        </div>
        <nav className="nav-menu">
          <button className="active">Courses</button>
          <button>Lessons</button>
          <button>Classrooms</button>
          <button className="logout-btn">Log Out</button>
        </nav>
      </div>
      {/* Main Content */}
      <div className="main-content">
        <div className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0' }}>
            <button
              className={activeTab === "my" ? "tab-btn active-tab" : "tab-btn"}
              style={{ borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}
              onClick={() => setActiveTab("my")}
            >
              My Courses
            </button>
            <button
              className={activeTab === "available" ? "tab-btn active-tab" : "tab-btn"}
              style={{ borderTopRightRadius: 8, borderBottomRightRadius: 8 }}
              onClick={() => setActiveTab("available")}
            >
              Available Courses
            </button>
          </div>
        </div>
        <div className="courses-container">
          {activeTab === "my" ? (
            <>
              <div className="courses-grid">
                {loading ? (
                  <div className="loading">Loading...</div>
                ) : studentCourses.length === 0 ? (
                  <div className="no-courses">No enrolled courses.</div>
                ) : (
                  studentCourses.map((course) => (
                    <div
                      key={course.course_code}
                      className="course-card"
                      onClick={() => handleCourseClick(course.course_code)}
                    >
                      <div className="course-code">{course.course_code}</div>
                      <div className="course-title">{course.course_title}</div>
                      <div className="course-credits">{course.course_total_credit} credits</div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="courses-grid">
                {loading ? (
                  <div className="loading">Loading...</div>
                ) : availableCourses.length === 0 ? (
                  <div className="no-courses">No available courses.</div>
                ) : (
                  availableCourses.map((course) => (
                    <div
                      key={course.course_code}
                      className="course-card"
                      onClick={() => handleCourseClick(course.course_code)}
                    >
                      <div className="course-code">{course.course_code}</div>
                      <div className="course-title">{course.course_title}</div>
                      <div className="course-credits">{course.course_total_credit} credits</div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentCourses;