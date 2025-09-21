import {
  getAllClassrooms,
  getClassroomsByInstructor,
  getClassroomByCode,
  deleteClassroom,
  updateClassroom,
  createClassroom,
  addClassroomLesson,
  addClassroomStudent,
  addClassroomStudentLesson,
  getClassroomsByStudent
} from "../models/classroom.js";

// ✅ Get all classrooms
export const getClassrooms = async (req, res) => {
  try {
    const classrooms = await getAllClassrooms();
    return res.status(200).json({ success: true, data: classrooms });
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch classrooms." });
  }
};

// ✅ Get instructor's classrooms
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

// ✅ Get a classroom by code
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

// ✅ Delete a classroom
export const removeClassroom = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await deleteClassroom(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Classroom does not exist." });
    }
    return res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    console.error("Error deleting classroom:", error);
    return res.status(500).json({ success: false, message: "Failed to delete classroom." });
  }
};

// ✅ Update a classroom
export const editClassroom = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updated = await updateClassroom({ id, updateData });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Classroom does not exist." });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating classroom:", error);
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