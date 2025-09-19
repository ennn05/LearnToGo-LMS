import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Classrooms.css"; // reuse same styling

function ClassroomDetails() {
  const { classroomId } = useParams(); // grabs ":classroomId" from the URL
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const { data: res } = await api.get(`classrooms/${classroomId}`);
        if (!res.success) {
          console.error("Error fetching classroom:", res.message);
          return;
        }
        setClassroom(res.data);
      } catch (error) {
        console.error("Error fetching classroom:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassroom();
  }, [classroomId]);

  if (loading) {
    return <div className="loading">Loading classroom details...</div>;
  }

  if (!classroom) {
    return <div className="no-classrooms">Classroom not found.</div>;
  }

  return (
    <div className="main-content">
      <div className="topbar">
        <h1>Classroom Details</h1>
      </div>

      <div className="classroom-details">
        <p><strong>ID:</strong> {classroom.cr_id}</p>
        <p><strong>Course:</strong> {classroom.course_title || classroom.course_code}</p>
        <p><strong>Supervisor ID:</strong> {classroom.supervisor_id}</p>
      </div>

      <button onClick={() => navigate("/classrooms")} className="fab">
        ←
      </button>
    </div>
  );
}

export default ClassroomDetails;
