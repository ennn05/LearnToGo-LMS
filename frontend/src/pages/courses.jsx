import React from "react";
import useStore from "../store";
import { Navigate } from "react-router-dom";
import InstructorCourses from "./InstructorCourses";
import StudentCourses from "./StudentCourses";
function Courses() {
    const {user} = useStore((state) => state);
    switch (user?.user_role) {
        case "student":
            return <StudentCourses />;
        case "instructor":
        case "admin":
            return <InstructorCourses />;
        default:
            return <Navigate to="/login" />;
    }
}

export default Courses;
