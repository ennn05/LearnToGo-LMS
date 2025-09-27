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

  it("should update classroom and students", async () => {
    crModel.updateClassroom.mockResolvedValue({ id: "123" });
    crModel.updateClassroomStudents.mockResolvedValue([{ id: "S1" }]);

    const req = mockReq({ id: "123" }, { students: ["S1"] });
    const res = mockRes();

    await editClassroom(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: "123" },
      lessons: [],
      students: [{ id: "S1" }],
    });
  });

  it("should fail if students update throws error", async () => {
    crModel.updateClassroom.mockResolvedValue({ id: "123" });
    crModel.updateClassroomStudents.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ id: "123" }, { students: ["S1"] });
    const res = mockRes();

    await editClassroom(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to update classroom's students.",
    });
  });

  it("should return 500 if updateClassroom throws error", async () => {
    crModel.updateClassroom.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ id: "123" }, {});
    const res = mockRes();

    await editClassroom(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to update classroom.",
    });
  });

  it("should update classroom, lessons, and students successfully", async () => {
    crModel.updateClassroom.mockResolvedValue({ id: "123", name: "Physics" });
    crModel.updateClassroomLessons.mockResolvedValue([{ id: "L1" }, { id: "L2" }]);
    crModel.updateClassroomStudents.mockResolvedValue([{ id: "S1" }, { id: "S2" }]);

    const req = mockReq(
        { id: "123" },
        { lessons: ["L1", "L2"], students: ["S1", "S2"], name: "Physics" }
    );
    const res = mockRes();

    await editClassroom(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: "123", name: "Physics" },
        lessons: [{ id: "L1" }, { id: "L2" }],
        students: [{ id: "S1" }, { id: "S2" }],
    });
  });
});
