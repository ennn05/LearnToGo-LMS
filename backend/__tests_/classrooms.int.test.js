import request from "supertest";
import express from "express";
import classroomRoutes from "../routes/classroomRoutes.js";
import {
  updateClassroom,
  updateClassroomLessons,
  updateClassroomStudents,
} from "../models/classroom.js";

// --- Mock DB layer ---
jest.mock("../models/classroom.js", () => ({
  updateClassroom: jest.fn(),
  updateClassroomLessons: jest.fn(),
  updateClassroomStudents: jest.fn(),
}));

// --- Mock auth middleware ---
// Inject role via `x-role` header
jest.mock("../middleware/authMiddleware.js", () => {
  const original = jest.requireActual("../middleware/authMiddleware.js");
  return {
    ...original,
    authenticate: (req, res, next) => {
      const role = req.headers["x-role"];
      if (!role) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      req.user = { id: 1, role };
      next();
    },
    // keep authorize real → it will check `req.user.role`
  };
});

const app = express();
app.use(express.json());
app.use("/classrooms", classroomRoutes);

afterEach(() => {
  jest.clearAllMocks();
});
