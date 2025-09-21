import express from "express";
import {authenticate, authorize} from "../middleware/authMiddleware.js";
import {
  getClassrooms,
  getInstructorClassrooms,
  getClassroom,
  removeClassroom,
  editClassroom,
  addClassroom,
  getStudentClassrooms
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

router.get("/instructor", authenticate, getInstructorClassrooms);
router.get("/:classroomCode", getClassroom);
router.delete("/:id", authenticate, removeClassroom);
router.put("/:id", authenticate, editClassroom);
router.post("/", authenticate, authorize("instructor"), addClassroom);

export default router;
