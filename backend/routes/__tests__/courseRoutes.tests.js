import request from "supertest";
import express from "express";
import courseRoutes from "../coursesRoutes.js";
import { getAvailableCoursesForEnrollment, getEnrolledStudentsByCourse, getPublished, updateCourseLessonAssignments } from "../../controllers/courseControllers.js";

// Mock controllers
jest.mock("../../controllers/courseControllers", () => ({
  getCourses: jest.fn((req, res) => res.status(200).json({ from: "getCourses" })),
  getStudentCourses: jest.fn((req, res) => res.status(200).json({ from: "getStudentCourses" })),
  getInstructorCourses: jest.fn((req, res) => res.status(200).json({ from: "getInstructorCourses" })),
  getAvailableCoursesForEnrollment: jest.fn((req, res) => res.status(200).json({ from: "getAvailableCoursesForEnrollment" })),
  getCourse: jest.fn((req, res) => res.status(200).json({ from: "getCourse" })),
  addCourse: jest.fn((req, res) => res.status(201).json({ from: "addCourse" })),
  removeCourse: jest.fn((req, res) => res.status(200).json({ from: "removeCourse" })),
  editCourse: jest.fn((req, res) => res.status(200).json({ from: "editCourse" })),
  enrollCourse: jest.fn((req, res) => res.status(201).json({ from: "enrollCourse" })),
  getPublished:  jest.fn((req, res) => res.status(201).json({ from: "getPublished" })),
  getEnrolledStudentsByCourse: jest.fn((req, res) => res.status(201).json({ from: "getEnrolledStudentsByCourse" })),
  updateCourseLessonAssignments: jest.fn((req, res) => res.status(201).json({ from: "updateCourseLessonAssignments" })),
}));

// Mock middleware
jest.mock("../../middleware/authMiddleware", () => {
  const original = jest.requireActual("../../middleware/authMiddleware.js");
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
app.use("/courses", courseRoutes);

describe("Course Routes", () => {
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


    describe("GET /courses/available route", () => {
        it("should call getAvailableCoursesForEnrollment if role is student", async () => {
            const res = await request(app).get("/courses/available").set("x-role", "student");

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ from: "getAvailableCoursesForEnrollment" });
        });

        it("should return 403 if role is instructor", async () => {
            const res = await request(app).get("/courses/available").set("x-role", "instructor");

            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: "Unauthorized" });
        });

        it("should return 403 if role is admin", async () => {
            const res = await request(app).get("/courses/available").set("x-role", "admin");

            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: "Unauthorized" });
        });

        it("should return 403 if role is missing", async () => {
            const res = await request(app).get("/courses/available");

            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: "Unauthorized" });
        });
    });

    describe("POST /courses/:courseCode/enroll", () => {
        it("should call enrollCourse if role is student", async () => {
            const res = await request(app).post("/courses/CSE101/enroll").set("x-role", "student");

            expect(res.status).toBe(201);
            expect(res.body).toEqual({ from: "enrollCourse" });
        });

        it("should return 403 if role is instructor", async () => {
            const res = await request(app).post("/courses/CSE101/enroll").set("x-role", "instructor");

            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: "Unauthorized" });
        });

        it("should return 403 if role is admin", async () => {
            const res = await request(app).post("/courses/CSE101/enroll").set("x-role", "admin");

            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: "Unauthorized" });
        });

        it("should return 403 if role is missing", async () => {
            const res = await request(app).post("/courses/CSE101/enroll");

            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: "Unauthorized" });
        });
    });
});
