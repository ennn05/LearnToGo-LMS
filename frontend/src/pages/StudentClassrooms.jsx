import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Courses.css";

function StudentClassrooms() {
    const [activeTab, setActiveTab] = useState("my");
    const [user, setUser] = useState(null);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch classrooms the student is enrolled in
    const fetchClassrooms = async () => {
        try {
            const { data: res } = await api.get("classrooms");
            if (!res.success) {
                setClassrooms([]);
            } else {
                setClassrooms(res.data);
            }
        } catch (error) {
            setClassrooms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchClassrooms();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };
