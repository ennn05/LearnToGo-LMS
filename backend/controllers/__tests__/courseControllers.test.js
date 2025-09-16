import { getAvailableCoursesForEnrollment, enrollCourse, getStudentCourses } from "../courseControllers.js";
import * as courseModel from "../../models/course.js"; // we will spyOn here

// Helper to mock Express res
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Controller: getAvailableCoursesForEnrollment", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { user: { id: 1, role: "student" } }; // default: valid student
    mockRes = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if no studentId", async () => {
    mockReq = {}; // missing user

    await getAvailableCoursesForEnrollment(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Unauthorized",
    });
  });

  it("should return 200 and list of courses if service succeeds", async () => {
    const mockCourses = [
      { course_code: "c1", course_title: "Math 101" },
      { course_code: "c2", course_title: "Physics 101" },
    ];

    jest.spyOn(courseModel, "getAvailableCoursesForStudent").mockResolvedValue(mockCourses);

    await getAvailableCoursesForEnrollment(mockReq, mockRes);

    expect(courseModel.getAvailableCoursesForStudent).toHaveBeenCalledWith(1);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: mockCourses,
    });
  });

  it("should return 500 if service throws an error", async () => {
    jest
      .spyOn(courseModel, "getAvailableCoursesForStudent")
      .mockRejectedValue(new Error("DB error"));

    await getAvailableCoursesForEnrollment(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to fetch available courses for student.",
    });
  });
});


describe("Controller: enrollCourse", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if courseCode is missing", async () => {
    const req = { user: { id: 1 }, params: {} };
    const res = mockResponse();

    await enrollCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Course code is required.",
    });
  });

  it("returns 401 if user is not authenticated", async () => {
    const req = { user: null, params: { courseCode: "CSE101" } };
    const res = mockResponse();

    await enrollCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Unauthorized",
    });
  });

  it("returns 201 and enrollment data on success", async () => {
    const req = { user: { id: 1 }, params: { courseCode: "CSE101" } };
    const res = mockResponse();

    const mockEnrollment = { student_id: 1, course_code: "CSE101" };
    jest.spyOn(courseModel, "addCourseEnrollment").mockResolvedValue(mockEnrollment);

    await enrollCourse(req, res);

    expect(courseModel.addCourseEnrollment).toHaveBeenCalledWith(1, "CSE101");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Enrolled successfully.",
      data: mockEnrollment,
    });
  });

  it("returns 409 if already enrolled", async () => {
    const req = { user: { id: 1 }, params: { courseCode: "CSE101" } };
    const res = mockResponse();

    jest.spyOn(courseModel, "addCourseEnrollment").mockResolvedValue(undefined);

    await enrollCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to enroll in course.",
    });
  });

  it("returns 500 on internal server error", async () => {
    const req = { user: { id: 1 }, params: { courseCode: "CSE101" } };
    const res = mockResponse();

    jest.spyOn(courseModel, "addCourseEnrollment").mockRejectedValue(new Error("DB error"));

    await enrollCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error.",
    });
  });
});


describe("Controller: getStudentCourses", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { user: { id: 1, role: "student" } }; // default: valid student
    mockRes = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if no studentId", async () => {
    mockReq = {}; // missing user

    await getStudentCourses(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Unauthorized",
    });
  });

  it("should return 200 and list of enrolled courses of the student if service succeeds", async () => {
    const mockCourses = [
      { course_code: "c1", course_title: "Math 101" },
      { course_code: "c2", course_title: "Physics 101" },
    ];

    jest.spyOn(courseModel, "getEnrolledCoursesByStudent").mockResolvedValue(mockCourses);

    await getStudentCourses(mockReq, mockRes);

    expect(courseModel.getEnrolledCoursesByStudent).toHaveBeenCalledWith(1);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: mockCourses,
    });
  });

  it("should return 200 and empty array if courses found is null", async () => {
    const mockCourses = null;

    jest.spyOn(courseModel, "getEnrolledCoursesByStudent").mockResolvedValue(mockCourses);

    await getStudentCourses(mockReq, mockRes);

    expect(courseModel.getEnrolledCoursesByStudent).toHaveBeenCalledWith(1);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: [],
    });
  });

  it("should return 200 and empty array if courses found is undefined", async () => {
    const mockCourses = undefined;

    jest.spyOn(courseModel, "getEnrolledCoursesByStudent").mockResolvedValue(mockCourses);

    await getStudentCourses(mockReq, mockRes);

    expect(courseModel.getEnrolledCoursesByStudent).toHaveBeenCalledWith(1);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: [],
    });
  });

  it("should return 500 if service throws an error", async () => {
    jest
      .spyOn(courseModel, "getEnrolledCoursesByStudent")
      .mockRejectedValue(new Error("DB error"));

    await getStudentCourses(mockReq, mockRes);

    expect(courseModel.getEnrolledCoursesByStudent).toHaveBeenCalledWith(1);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to fetch enrolled courses for student.",
    });
  });
});

