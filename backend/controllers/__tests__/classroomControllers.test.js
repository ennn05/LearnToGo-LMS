import { editClassroom } from "../classroomController.js";

// Mock dependencies
import * as crModel from "../../models/classroom.js";

jest.mock("../../models/classroom.js", () => ({
  updateClassroom: jest.fn(),
  updateClassroomLessons: jest.fn(),
  updateClassroomStudents: jest.fn(),
}));

// Mock req/res helpers
const mockReq = (params = {}, body = {}) => ({ params, body });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("editClassroom controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if classroom does not exist", async () => {
    crModel.updateClassroom.mockResolvedValue(null);

    const req = mockReq({ id: "123" }, {});
    const res = mockRes();

    await editClassroom(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Classroom does not exist.",
    });
  });

  it("should update classroom only (no lessons/students)", async () => {
    crModel.updateClassroom.mockResolvedValue({ id: "123", name: "Test" });

    const req = mockReq({ id: "123" }, { name: "Test" });
    const res = mockRes();

    await editClassroom(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: "123", name: "Test" },
      lessons: [],
      students: [],
    });
  });

  it("should update classroom and lessons", async () => {
    crModel.updateClassroom.mockResolvedValue({ id: "123" });
    crModel.updateClassroomLessons.mockResolvedValue([{ id: "L1" }]);

    const req = mockReq({ id: "123" }, { lessons: ["L1"] });
    const res = mockRes();

    await editClassroom(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: "123" },
      lessons: [{ id: "L1" }],
      students: [],
    });
  });

  it("should fail if lessons update throws error", async () => {
    crModel.updateClassroom.mockResolvedValue({ id: "123" });
    crModel.updateClassroomLessons.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ id: "123" }, { lessons: ["L1"] });
    const res = mockRes();

    await editClassroom(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to update classroom's lessons.",
    });
  });
});
