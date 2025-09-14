import { getAvailableCoursesForEnrollment } from "../courseControllers.js";
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
