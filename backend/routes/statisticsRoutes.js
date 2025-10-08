import express from "express";
import {authenticate, authorize} from "../middleware/authMiddleware";
import { getTotalNumCourses } from "../controllers/statisticsControllers";

const router = express.Router();

router.get("/courses/total", authenticate, authorize("admin", "instructor"), (req, res) => {
            switch (req?.user?.role) {
                case "instructor":
                    // return 
                case "admin":
                    return getTotalNumCourses(req, res);
                default:
                    return res.status(403).json({ message: "Unauthorized" });
            }
        });

export default router;