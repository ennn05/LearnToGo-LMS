import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Lessons.css";

function StudentLessons() {

    // For testing purpose only - replace with ur FE code
    const fetchLessons = async () => {
        try {
            const { data: res } = await api.get("lessons");
            console.log(res.data);
        } catch (error) {
            console.error("Error fetching student lessons:", error);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, []);

    return <div>Student Lessons Page</div>;
}

export default StudentLessons;