import request from "supertest";
import express from "express";
import classroomRoutes from "../routes/classroomRoutes.js";
import {
  updateClassroom,
  updateClassroomLessons,
  updateClassroomStudents,
  getStudentAvailableClassroomsToJoin
} from "../models/classroom.js";

// --- Mock DB layer ---
jest.mock("../models/classroom.js", () => ({
  updateClassroom: jest.fn(),
  updateClassroomLessons: jest.fn(),
  updateClassroomStudents: jest.fn(),
  getStudentAvailableClassroomsToJoin: jest.fn(),
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

  it("🚫 blocks student from editing classroom", async () => {
    const res = await request(app)
      .put(baseUrl)
      .set("x-role", "student")
      .send({ name: "Hack" });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Unauthorized" });
    expect(updateClassroom).not.toHaveBeenCalled();
  });

  it("🚫 blocks unauthenticated user", async () => {
    const res = await request(app)
      .put(baseUrl)
      .send({ name: "NoAuth" });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Unauthorized" });
    expect(updateClassroom).not.toHaveBeenCalled();
  });

  it("💥 returns 404 if classroom does not exist", async () => {
    updateClassroom.mockResolvedValue(null);

    const res = await request(app)
      .put(baseUrl)
      .set("x-role", "instructor")
      .send({ name: "NotFound" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/does not exist/i);
  });

  it("💥 returns 500 if DB update fails", async () => {
    updateClassroom.mockRejectedValue(new Error("DB crash"));

    const res = await request(app)
      .put(baseUrl)
      .set("x-role", "instructor")
      .send({ name: "Fail" });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/failed to update classroom/i);
  });
});


describe("Integration: GET /classrooms/available", () => {
  it("returns available classrooms for student", async () => {
    getStudentAvailableClassroomsToJoin.mockResolvedValue([
      { id: "1", name: "Math 101" }
    ]);

    const res = await request(app)
      .get("/classrooms/available")
      .set("x-role", "student");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([{ id: "1", name: "Math 101" }]);

    expect(getStudentAvailableClassroomsToJoin).toHaveBeenCalledTimes(1);
    expect(getStudentAvailableClassroomsToJoin).toHaveBeenCalledWith(1);
  });

  it("blocks non-students", async () => {
    const res = await request(app)
      .get("/classrooms/available")
      .set("x-role", "instructor");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Unauthorized" });

    expect(getStudentAvailableClassroomsToJoin).not.toHaveBeenCalled();
  });

  it("returns 500 on internal server error", async () => {
    getStudentAvailableClassroomsToJoin.mockRejectedValue(new Error("DB Error"));

    const res = await request(app)
      .get("/classrooms/available")
      .set("x-role", "student");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Failed to fetch available classrooms for student.");

    expect(getStudentAvailableClassroomsToJoin).toHaveBeenCalledWith(1);
  });
});
