import request from "supertest";
import express from "express";
import courseRoutes from "../routes/coursesRoutes.js";
import authenticate from "../middleware/authMiddleware.js";
import { getAllCourses, getEnrolledCoursesByStudent, getAvailableCoursesForStudent, addCourseEnrollment } from "../models/course.js";
import { enrollCourse } from "../controllers/courseControllers.js";

// We don't mock controllers here → we want them to run with real logic
// But for DB integration, you can use a test database or sqlite memory

// Mock DB layer to avoid hitting production DB
jest.mock("../models/course.js", () => ({
  getAllCourses: jest.fn(() =>
    Promise.resolve([
      { course_code: "CSE101", course_title: "Intro to CS", course_status: "published", course_total_credit: 3 },
      { course_code: "MATH201", course_title: "Calculus II", course_status: "draft", course_total_credit: 4 },
    ])
  ),
  getEnrolledCoursesByStudent: jest.fn(() =>
    Promise.resolve([
      { course_code: "CSE101", course_title: "Intro to CS", course_status: "published", course_total_credit: 3 },
    ])
  ),
  getAvailableCoursesForStudent: jest.fn(() =>
    Promise.resolve([
      { course_code: "CSE101", course_title: "Intro to CS", course_status: "published", course_total_credit: 3 },
    ])
  ),
  addCourseEnrollment: jest.fn((studentId, courseCode) =>
    Promise.resolve({ student_id: studentId, course_code: courseCode })
  ),
}));

// Mock middleware
jest.mock("../middleware/authMiddleware", () => {
  const original = jest.requireActual("../middleware/authMiddleware.js");
  return {
    ...original,
    authenticate: (req, res, next) => {
      req.user = { id: 1, role: req.headers["x-role"] };
      next();
    },
    // leave authorize as real
  };
});

const app = express();
app.use(express.json());
app.use("/courses", courseRoutes);

afterEach(() => {
  jest.clearAllMocks();
});


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


describe("Integration: GET /courses/available", () => {
  it("returns available courses for students", async () => {
    const res = await request(app)
      .get("/courses/available")
      .set("x-role", "student"); // authorize as student

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].course_code).toBe("CSE101");
    expect(res.body).toEqual({
      success: true,
      data: [
        { course_code: "CSE101", course_title: "Intro to CS", course_status: "published", course_total_credit: 3 }
      ]
    });
  });

  it("blocks non-students", async () => {
    const res = await request(app)
      .get("/courses/available")
      .set("x-role", "instructor"); // not allowed

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Unauthorized" });

  });
});


describe("Integration: POST /courses/:courseCode/enroll", () => {
  it("enrolls student successfully", async () => {
    const res = await request(app)
      .post("/courses/CSE101/enroll")
      .set("x-role", "student");

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(
        { course_code: "CSE101", student_id: 1 }
      );
  });

  it("prevents duplicate enrollment", async () => {
    addCourseEnrollment.mockResolvedValueOnce(undefined);

    const res = await request(app)
      .post("/courses/CSE101/enroll")
      .set("x-role", "student");

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Failed to enroll in course.");
  });

  it("handle internal server error", async () => {
    addCourseEnrollment.mockRejectedValue(new Error("DB Error"));

    const res = await request(app)
      .post("/courses/CSE101/enroll")
      .set("x-role", "student");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal server error.");
  });

  it("blocks non-students", async () => {
    const res = await request(app)
      .post("/courses/CSE101/enroll")
      .set("x-role", "instructor");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Unauthorized" });
  });
});
