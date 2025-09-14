import request from "supertest";
import express from "express";
import courseRoutes from "../coursesRoutes.js";

// Mock controllers
jest.mock("../../controllers/courseControllers", () => ({
  getCourses: jest.fn((req, res) => res.status(200).json({ from: "getCourses" })),
  getStudentCourses: jest.fn((req, res) => res.status(200).json({ from: "getStudentCourses" })),
  getInstructorCourses: jest.fn((req, res) => res.status(200).json({ from: "getInstructorCourses" })),
  getCourse: jest.fn((req, res) => res.status(200).json({ from: "getCourse" })),
  addCourse: jest.fn((req, res) => res.status(201).json({ from: "addCourse" })),
  removeCourse: jest.fn((req, res) => res.status(200).json({ from: "removeCourse" })),
  editCourse: jest.fn((req, res) => res.status(200).json({ from: "editCourse" })),
}));


// Mock middleware
jest.mock("../../middleware/authMiddleware", () =>
  jest.fn((req, res, next) => {
    // Simulate req.user being injected by middleware
    req.user = { id: 1, role: req.headers["x-role"] }; // set role from test header
    next();
  })
);

const app = express();
app.use("/courses", courseRoutes);

describe("GET /courses route", () => {
  it("should call getStudentCourses if role is student", async () => {
    const res = await request(app).get("/courses").set("x-role", "student");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ from: "getStudentCourses" });
  });

  it("should call getCourses if role is instructor", async () => {
    const res = await request(app).get("/courses").set("x-role", "instructor");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ from: "getCourses" });
  });

  it("should call getCourses if role is admin", async () => {
    const res = await request(app).get("/courses").set("x-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ from: "getCourses" });
  });

  it("should return 403 if role is unauthorized", async () => {
    const res = await request(app).get("/courses").set("x-role", "guest");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Unauthorized" });
  });

  it("should return 403 if role is missing", async () => {
    const res = await request(app).get("/courses");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Unauthorized" });
  });
});
