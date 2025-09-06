import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import sql from '../db.js';

const router = express.Router();

router.get("/", authenticate, (req, res) => {
    console.log("Lessons route is working");
    sql`SELECT * FROM "LMS".lesson;`
        .then(lessons => {
            res.json({ lessons });
        })
        .catch(err => {
            console.error("Error fetching lessons:", err);
            res.status(500).json({ message: "Internal server error" });
        });
});

export default router;
