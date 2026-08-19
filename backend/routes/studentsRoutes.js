import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getStudents, removeStudent} from '../controllers/studentController.js';

const router = express.Router();

router.get("/", authenticate, authorize("instructor", "admin"), getStudents);
router.delete("/:id", authenticate, authorize("instructor", "admin"), removeStudent);

export default router;
