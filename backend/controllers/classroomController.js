import {
  getAllClassrooms,
  getClassroomsByInstructor,
  getClassroomByCode,
  deleteClassroom,
  updateClassroom,
  createClassroom,
  addClassroomLesson,
  addClassroomStudent,
  editStudentMarksForClassroomLesson,
  getLessonsWithStudentsByClassroom,
  addClassroomStudentLesson,
  getClassroomsByStudent,
  updateClassroomLessons,
  updateClassroomStudents,
  getStudentAvailableClassroomsToJoin
} from "../models/classroom.js";

// Get all classrooms
export const getClassrooms = async (req, res) => {
  try {
    const classrooms = await getAllClassrooms();
    return res.status(200).json({ success: true, data: classrooms });
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch classrooms." });
  }
};

// Get instructor's classrooms
export const getInstructorClassrooms = async (req, res) => {
  const instructorId = req?.user?.id;
  if (!instructorId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const classrooms = await getClassroomsByInstructor(instructorId);
    return res.status(200).json({ success: true, data: classrooms });
  } catch (error) {
    console.error("Error fetching classrooms by instructor:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch classrooms by instructor." });
  }
};

export const getStudentClassrooms = async (req, res) => {
  const studentId = req?.user?.id;
  if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const classrooms = await getClassroomsByStudent(studentId);
    return res.status(200).json({ success: true, data: classrooms });
  } catch (error) {
    console.error("Error fetching classrooms by student:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch classrooms by student." });
  }
};

// Get a classroom by code
export const getClassroom = async (req, res) => {
  const { classroomCode } = req.params;
  try {
    const classroom = await getClassroomByCode(classroomCode);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found." });
    }
    return res.status(200).json({ success: true, data: classroom });
  } catch (error) {
    console.error("Error fetching classroom:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch classroom." });
  }
};

export const removeClassroom = async (req, res) => {
  const { id } = req.params; // this is the cr_id from frontend
  console.log("Deleting classroom with cr_id:", id);
  try {
    const deleted = await deleteClassroom(id);
    console.log("Deleted result:", deleted);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Classroom does not exist." });
    }
    return res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    console.error("Error deleting classroom:", error);
    return res.status(500).json({ success: false, message: "Failed to delete classroom." });
  }
};

export const editClassroom = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  console.log("Update request for classroom:", id);
  console.log("Update data:", updateData);

  try {
    const updated = await updateClassroom(id, updateData);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Classroom does not exist." });
    }

    let updatedLessons = [];
    if (updateData.lessons && Array.isArray(updateData.lessons)) {
        try {
          console.log("Updating lessons:", updateData.lessons);
          updatedLessons = await updateClassroomLessons(id, updateData.lessons);
          console.log("Lessons updated successfully:", updatedLessons);
        } catch (error) {
          console.error("Error updating classroom's lessons:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to update classroom's lessons."
          });
        }
    }

    let updatedStudents = [];
    if (updateData.students && Array.isArray(updateData.students)) {
        try {
          console.log("Updating students:", updateData.students);
          updatedStudents = await updateClassroomStudents(id, updateData.students);
          console.log("Students updated successfully:", updatedStudents);
        } catch (error) {
          console.error("Error updating classroom's students:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to update classroom's students."
          });
        }
    }

    return res.status(200).json({ success: true, data: updated, lessons: updatedLessons, students: updatedStudents });
  } catch (error) {
    console.error("Error updating classroom:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ success: false, message: "Failed to update classroom." });
  }
};

export const addClassroom = async (req, res) => {
  console.log("REQUEST BODY:", req.body);
  const {
                cr_id,
                cr_start_date,
                cr_duration,
                cr_status,
                course_code,
                cr_creator,
                cr_date_created,
                cr_date_updated,
                supervisor_id,
                lessons,
                students,
            } = req.body;
    try {
        if (!cr_id || !cr_start_date || !cr_duration || !course_code || !cr_creator || !supervisor_id)
        {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existClassroom = await getClassroomByCode(cr_id);
        if (existClassroom) {
            return res.status(400).json({ success: false, message: "Classroom already exists" });
        }

        const today = new Date().toISOString().split('T')[0];

        const classroomData = {
            cr_id,
            cr_start_date,
            cr_duration,
            cr_status: cr_status ?? "draft",
            course_code,
            cr_creator,
            cr_date_created: cr_date_created ?? today,
            cr_date_updated: cr_date_updated ?? today,
            supervisor_id,
        };

        const classroom = await createClassroom(classroomData);
        if (classroom) {
          let createdLessons = [];
          let createdStudents = [];
            try {
                for (const element of lessons) {
                    const crcl = await addClassroomLesson(cr_id, element);
                    if(crcl) createdLessons.push(crcl);
                }

            } catch(error)
            {
                console.error("Error in adding lesson to classroom:", error);
                return res.status(500).json({ success: false, message: "Failed to add lesson to classroom." });
            }

            try {
                for (const element of students) {
                    const cs = await addClassroomStudent(cr_id, element);
                    if(cs) createdStudents.push(cs);
                }

            } catch(error)
            {
                console.error("Error in adding student to classroom:", error);
                return res.status(500).json({ success: false, message: "Failed to add student to classroom." });
            }


            try {
                for (const crcl of createdLessons) {
                  for (const cs of createdStudents) {
                    await addClassroomStudentLesson(cs.cs_id, crcl.crcl_id);
                  }
                }
            }
            catch (error) {
              console.error("Error in adding cl_stu_lesson records:", error);
              return res.status(500).json({ success: false, message: "Failed to link students with lessons." });
            }

            return res.status(201).json({ success: true, data: classroom });
        }
        return res.status(404).json({ success: false, message: "Classroom not found." });
    }
    catch (error) {
        console.error("Error in creating classroom:", error);
        return res.status(500).json({ success: false, message: "Failed to create classroom." });
    }
};

export const updateStudentMarksForClassroomLesson = async (req, res) => {
  const { cr_id, crcl_cl_id } = req.params;
  const students = req.body; // Expecting an array of { stucourse_id, attendance, grade, completion }
  console.log(students);
  try { 
    const results = await Promise.all(
      students.map(student => 
        editStudentMarksForClassroomLesson(cr_id, crcl_cl_id, student)
      )
    );
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error updating student marks:", error);
    return res.status(500).json({ success: false, message: "Failed to update student marks." });
  }
};


export const getClassroomLessonsWithStudents = async (req, res) => {
  const { cr_id } = req.params;

  console.log("Fetching lessons with students for classroom:", cr_id);
  try {
    const lessons = await getLessonsWithStudentsByClassroom(cr_id);

    return res.status(200).json({ success: true, data: lessons });
  } catch (error) {
    console.error("Error fetching classroom lessons with students:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch classroom lessons." });
  }
};

export const getAvailableClassroomsForStudent = async (req, res) => {
  const {id} = req.user;

  if (!id) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  try {
    const classrooms = await getStudentAvailableClassroomsToJoin(id);

    return res.status(200).json({ success: true, data: classrooms });
  } catch (error) {
    console.error("Error fetching available classrooms for student:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch available classrooms for student." });
  }
};

export const joinClassroom = async (req, res) => {
  const { cr_id, stucourse_id } = req.params;  // classroom ID
  const studentId = req?.user?.id;

  if (!studentId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // Check if already joined
    const classrooms = await getClassroomsByStudent(studentId);
    const already = classrooms.find(c => c.cr_id === cr_id);
    if (already) {
      return res.status(400).json({ success: false, message: "Already joined this classroom." });
    }

    // Add student to classroom
    const result = await addClassroomStudent(cr_id, stucourse_id);
    if (!result) {
      return res.status(500).json({ success: false, message: "Failed to join classroom." });
    }

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("Error joining classroom:", error);
    return res.status(500).json({ success: false, message: "Error while joining classroom." });
  }
};