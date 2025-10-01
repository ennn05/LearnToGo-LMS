import express from "express";
import {authenticate, authorize} from "../middleware/authMiddleware.js";
import {
  getClassrooms,
  getInstructorClassrooms,
  getClassroom,
  removeClassroom,
  editClassroom,
  addClassroom,
  updateStudentMarksForClassroomLesson,
  getClassroomLessonsWithStudents,
  getStudentClassrooms,
  joinClassroom
} from "../controllers/classroomController.js";

const router = express.Router();


router.get("/", authenticate, (req, res) => {
  switch (req?.user?.role) {
        case "student":
            return getStudentClassrooms(req, res);
        case "instructor":
        case "admin":
            return getClassrooms(req, res);
        default:
            return res.status(403).json({ message: "Unauthorized" });
    }    
});

router.get("/student/available", authenticate, getAvailableClassroomsForStudent);
router.post("/:cr_id/join", authenticate, joinClassroom);

router.get("/instructor", authenticate, getInstructorClassrooms);
router.get("/:classroomCode", getClassroom);
router.delete("/:id", authenticate, authorize("instructor"), removeClassroom);
router.put("/:id", authenticate, editClassroom);
router.post("/", authenticate, authorize("instructor"), addClassroom);
router.put("/:cr_id/lessons/:crcl_cl_id/students", authenticate, authorize("instructor"), updateStudentMarksForClassroomLesson);
router.get("/:cr_id/lessons/students", authenticate, authorize("instructor"), getClassroomLessonsWithStudents);

export default router;
