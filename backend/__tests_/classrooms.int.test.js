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

//
// ------------------- TESTS -------------------
//
describe("Integration: PUT /classrooms/:id", () => {
  const classroomId = "c1";
  const baseUrl = `/classrooms/${classroomId}`;

  it("✅ allows instructor to edit classroom fully (name + lessons + students)", async () => {
    const payload = {
      name: "Updated Name",
      lessons: [{ id: "l1", title: "Lesson 1" }],
      students: [{ id: "s1", name: "Student 1" }],
    };

    updateClassroom.mockResolvedValue({ id: classroomId, name: "Updated Name" });
    updateClassroomLessons.mockResolvedValue(payload.lessons);
    updateClassroomStudents.mockResolvedValue(payload.students);

    const res = await request(app)
      .put(baseUrl)
      .set("x-role", "instructor")
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ id: classroomId, name: "Updated Name" });
    expect(res.body.lessons).toEqual(payload.lessons);
    expect(res.body.students).toEqual(payload.students);
  });
});
