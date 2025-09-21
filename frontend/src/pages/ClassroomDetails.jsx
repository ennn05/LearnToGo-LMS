import React from "react";
import useStore from "../store";
import { Navigate } from "react-router-dom";
import InstructorClassroomDetails from "./InstructorClassroomDetails";
import StudentClassroomDetails from "./StudentClassroomDetails";

function ClassroomDetails() {
    const {user} = useStore((state) => state);
    switch (user?.user_role) {
        case "student":
            return <StudentClassroomDetails />;
        case "instructor":
        case "admin":
            return <InstructorClassroomDetails />;
        default:
            return <Navigate to="/login" />;
    }
}

export default ClassroomDetails;