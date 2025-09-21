import { useEffect } from "react";
import api from "../libs/apiCalls";

function StudentClassrooms() {
    // for testing purpose only - replace with ur FE code

    // use api.get("classrooms") to fetch the list of student's classrooms
    const fetchClassrooms = async () => {
        const {data: res} = await api.get("classrooms");
        console.log(res.data);
    }

    useEffect(() => {
        fetchClassrooms();
    }, []);

    return (
        <div>
            <h1>Student Classrooms</h1>
        </div>
    );
}

export default StudentClassrooms;