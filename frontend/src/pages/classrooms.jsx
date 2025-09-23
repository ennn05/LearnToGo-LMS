import React from "react";
import useStore from "../store";
import { Navigate } from "react-router-dom";
import InstructorClassrooms from "./InstructorClassrooms";
import StudentClassrooms from "./StudentClassrooms";

function Classrooms() {
    const {user} = useStore((state) => state);
    switch (user?.user_role) {
        case "student":
            return <StudentClassrooms />;
        case "instructor":
        case "admin":
            return <InstructorClassrooms />;
        default:
            return <Navigate to="/login" />;
    }
}

export default Classrooms;