import React from "react";
import useStore from "../store";
import StudentCourseDetails from "./StudentCourseDetails";
import InstructorCourseDetails from "./InstructorCourseDetails";

function CourseDetails() {
    const {user} = useStore((state) => state);
    switch (user?.user_role) {
        case "student":
            return <StudentCourseDetails />;
        case "admin":
        case "instructor":
            return <InstructorCourseDetails />;
        default:
            return <div>Unauthorized</div>;
    }
  };

export default CourseDetails;