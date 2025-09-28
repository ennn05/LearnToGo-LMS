import request from "supertest";
import express from "express";
import classroomRoutes from "../routes/classroomRoutes.js";
import { getStudentAvailableClassroomsToJoin } from "../models/classroom.js";

// Mock DB/service layer
jest.mock("../models/classroom.js", () => ({
  getStudentAvailableClassroomsToJoin: jest.fn()
}));

// Mock auth middleware: inject user into req
jest.mock("../middleware/authMiddleware.js", () => {
  const original = jest.requireActual("../middleware/authMiddleware.js");
  return {
    ...original,
    authenticate: (req, res, next) => {
      req.user = { id: 1, role: req.headers["x-role"] };
      next();
    },
    // leave authorize as real so role checks are enforced
  };
});

const app = express();
app.use(express.json());
app.use("/classrooms", classroomRoutes);

afterEach(() => {
  jest.clearAllMocks();
});

describe("Integration: GET /classrooms/available", () => {
});
