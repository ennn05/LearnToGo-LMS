import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditCourse.css";

function EditCourse() {
    const { courseId } = useParams();
    const [activePage, setActivePage] = useState("courses");
    const [user, setUser] = useState(null);
    const [courseData, setCourseData] = useState({
        courseCode: "",
        courseTitle: "",
        totalCredits: "",
        status: "draft",
    });
    const [assignedLessons, setAssignedLessons] = useState([]);
    const [availableLessons, setAvailableLessons] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchCourseDetails = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/courses/instructor/${courseId}`);
            if (!res.ok) {
                console.error("Error fetching courses:", res);
            }
            const data = await res.json();
            console.log("Course details loaded:", data.data);
            console.log(data.data.lessons);
            setCourseData(data.data);
        } catch (error) {
            console.error("Error fetching course details:", error);
            setError("Course not found");
        } finally {
            setLoading(false);
        }
    };

    const fetchLessons = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/lessons");
            if (!response.ok) {
                console.error("API error:", response.status, response.statusText);
                setAvailableLessons([]);
                return;
            }
            const data = await response.json();
            setAvailableLessons(
                data.data.filter(lesson => lesson.lesson_status === "published")
            );
        } catch (error) {
            console.error("Error fetching lessons:", error);
            setAvailableLessons([]);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // Mock user
            setUser({
                user_fname: "Test",
                user_lname: "User",
                user_email: "test@example.com",
                user_role: "Instructor",
            });
        }
        fetchCourseDetails();
        fetchLessons();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prev => ({
            ...prev,
            [name]: value,
            totalCredits: assignedLessons.reduce((sum, lesson) => lesson.lesson_credit + sum, 0)
        }));
    };

    const handleStatusChange = (newStatus) => {
        setCourseData(prev => ({
            ...prev,
            status: newStatus
        }));
    };

    const handlePublishCourse = async () => {
        try {
            if (!courseData.courseCode || !courseData.courseTitle || !courseData.totalCredits) {
                alert("Please fill in all required fields (Course Code, Title, and Credits) before publishing.");
                return;
            }
            const publishedCourseData = { ...courseData, status: "published" };
            setCourseData(publishedCourseData);
            const courseToSave = {
                course_code: publishedCourseData.courseCode,
                course_title: publishedCourseData.courseTitle,
                total_credits: parseInt(publishedCourseData.totalCredits),
                status: "published",
                assignedLessons: assignedLessons.map(l => l.lesson_id)
            };
            console.log("Publishing course:", courseToSave);
            alert("Course published successfully!");
            navigate("/courses");
        } catch (error) {
            console.error("Error publishing course:", error);
            alert("Failed to publish course. Please try again.");
        }
    };

    const addLessonToCourse = (lesson) => {
        if (!assignedLessons.find(l => l.lesson_id === lesson.lesson_id)) {
            setAssignedLessons(prev => [...prev, lesson]);
        }
    };

    const removeLessonFromCourse = (lessonId) => {
        setAssignedLessons(prev => prev.filter(l => l.lesson_id !== lessonId));
    };

    const filteredLessons = Array.isArray(availableLessons)
        ? availableLessons.filter(
            (lesson) =>
                lesson.lesson_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lesson.lesson_desc?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        : [];
    
    const handleSaveCourse = async () => {
        try {
            if (!courseData.courseCode || !courseData.courseTitle) {
                alert("Please fill in all required fields (Course Code, Title, and Credits) before saving.");
                return;
            }
            const courseToSave = {
                code: courseData.courseCode,
                title: courseData.courseTitle,
                status: courseData.status,
                creator: user.user_id,
                credit: courseData.totalCredits,
                lessons: assignedLessons.map(l => l.lesson_id)
            };
            const response = await fetch("http://localhost:5000/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(courseToSave)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save course");
            }
            alert("Course saved successfully!");
            navigate("/courses");
        } catch (error) {
            console.error("Error saving course:", error);
            alert("Failed to save course. Please try again.");
        }
    };

    const handleCancel = () => {
        navigate("/courses");
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const currentDate = new Date().toLocaleDateString();

    return (
        <div className="flex">
            {}
        </div>
    )
}

export default EditCourse;