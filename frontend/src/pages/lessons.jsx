import React from "react";
import useStore from "../store";
import { Navigate } from "react-router-dom";
import InstructorLessons from "./InstructorLessons";
import StudentLessons from "./StudentLessons";

function Lessons() {
    const {user} = useStore((state) => state);
    switch (user?.user_role) {
        case "student":
            return <StudentLessons />;
        case "instructor":
        case "admin":
            return <InstructorLessons />;
        default:
            return <Navigate to="/login" />;
    }
}

export default Lessons;
