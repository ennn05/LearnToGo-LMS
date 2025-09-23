import React from "react";
import useStore from "../store";
import { Navigate } from "react-router-dom";
import InstructorLessonDetails from "./InstructorLessonDetails";
import StudentLessonDetails from "./StudentLessonDetails";

function LessonDetails() {
    const {user} = useStore((state) => state);
    switch (user?.user_role) {
        case "student":
            return <StudentLessonDetails />;
        case "instructor":
        case "admin":
            return <InstructorLessonDetails />;
        default:
            return <Navigate to="/login" />;
    }
}

export default LessonDetails;
