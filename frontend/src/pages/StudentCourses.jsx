import React, { useEffect, useState } from "react";
import api from "../libs/apiCalls";
/*
  The below component is just a temporary placeholder for the StudentCourses page.
  (FOR TESTING BACKEND PURPOSES ONLY).

  Please replace it with your actual implementation later.

  For fetching student-enrolled courses, use: 
    await api.get("courses")

  For fetching available courses that students can browse for enrollment, use:
    await api.get("courses/available")
*/
function StudentCourses() {
  const [studentCourses, setStudentCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  useEffect(() => {
    const fetchStudentEnrolledCourses = async () => {
      try {
        const {data: response} = await api.get("courses");
        console.log("Responses: ", response);
        console.log("Student Courses loaded:", response.data);
        setStudentCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const fetchAvailableCoursesForEnrollment = async () => {
      try {
        const {data: response} = await api.get("courses/available");
        console.log("Responses: ", response);
        console.log("Available Courses loaded:", response.data);
        setAvailableCourses(response.data);
      } catch (error) {
        console.error("Error fetching available courses:", error);
      }
    };

    fetchStudentEnrolledCourses();
    fetchAvailableCoursesForEnrollment();
  }, []);

  return (
    <div>
      <h1>Student Courses</h1>
      <ul>
        {studentCourses.map((course) => (
          <li key={course.course_code}>{course.course_title}</li>
        ))}
      </ul>
    </div>
  );
}
export default StudentCourses;