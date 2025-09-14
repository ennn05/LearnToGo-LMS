import request from "supertest";
import express from "express";
import courseRoutes from "../routes/coursesRoutes.js";
import authenticate from "../middleware/authMiddleware.js";
import { getAllCourses, getEnrolledCoursesByStudent } from "../models/course.js";

// We don't mock controllers here → we want them to run with real logic
// But for DB integration, you can use a test database or sqlite memory

// Mock DB layer to avoid hitting production DB
jest.mock("../models/course.js", () => ({
  getAllCourses: jest.fn(() =>
    Promise.resolve([
      { course_code: "CSE101", course_title: "Intro to CS", course_total_credit: 3 },
      { course_code: "MATH201", course_title: "Calculus II", course_total_credit: 4 },
    ])
  ),
  getEnrolledCoursesByStudent: jest.fn(() =>
    Promise.resolve([
      { course_code: "CSE101", course_title: "Intro to CS", course_total_credit: 3 },
    ])
  ),
}));

// Mock middleware
jest.mock("../middleware/authMiddleware", () =>
  jest.fn((req, res, next) => {
    // Simulate req.user being injected by middleware
    req.user = { id: 1, role: req.headers["x-role"] }; // set role from test header
    next();
  })
);

const app = express();
app.use(express.json());
app.use("/courses", courseRoutes);

describe("Integration: /courses routes", () => {
  it("returns student courses if user role is student", async () => {
    const res = await request(app)
      .get("/courses")
      .set("x-role", "student"); // role injected via middleware

    expect(res.status).toBe(200);
    console.log(res.body);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].course_code).toBe("CSE101");
  });

  it("returns all courses if user role is instructor", async () => {
    const res = await request(app)
      .get("/courses")
      .set("x-role", "instructor");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it("blocks unauthorized users", async () => {
    const res = await request(app)
      .get("/courses")
      .set("x-role", "guest");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Unauthorized" });
  });
});
