import React, { useEffect, useState } from "react";
import api from "../libs/apiCalls";
/*
  The below component is just a temporary placeholder for the StudentCourses page.
  (FOR TESTING BACKEND PURPOSES ONLY).

  Please replace it with your actual implementation later.
*/
function StudentCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const {data: response} = await api.get("courses");
        console.log("Courses loaded:", response);
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div>
      <h1>Student Courses</h1>
      <ul>
        {courses.map((course) => (
          <li key={course.course_code}>{course.course_title}</li>
        ))}
      </ul>
    </div>
  );
}
export default StudentCourses;