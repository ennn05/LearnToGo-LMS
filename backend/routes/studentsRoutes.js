import express from 'express';
import { getStudents, removeStudent} from '../controllers/studentController.js';

const router = express.Router();

router.get("/", getStudents);
router.delete("/:id", removeStudent);

export default router;
