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
});
