import React from "react";
import api from "../libs/apiCalls.js";

const Lessons = () => {
    
    const showLessons = async () => {
        try {
            const response = await api.get("/lessons");
            console.log("Lessons data:", response.data);
        } catch (error) {
            console.error("Error fetching lessons:", error);
        }
    };

  return (
    <div>
      <h1>Lessons</h1>
      <button onClick={showLessons}>Show Lessons</button>
    </div>
  );
}

export default Lessons;