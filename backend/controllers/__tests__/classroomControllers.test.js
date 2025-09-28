import { getAvailableClassroomsForStudent } from "../classroomController.js";

// Mock dependencies
import * as crModel from "../../models/classroom.js";


describe("getAvailableClassroomsForStudent controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = { user: { id: "student123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 if no user id is provided", async () => {
    req = { user: {} };

    jest.spyOn(crModel, "getStudentAvailableClassroomsToJoin");

    await getAvailableClassroomsForStudent(req, res);

    expect(crModel.getStudentAvailableClassroomsToJoin).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized"
    });
  });

  it("should return 200 with classrooms if service resolves", async () => {
    const mockClassrooms = [
      { id: "1", name: "Math 101" },
      { id: "2", name: "Science 201" }
    ];

    jest
      .spyOn(crModel, "getStudentAvailableClassroomsToJoin")
      .mockResolvedValue(mockClassrooms);

    await getAvailableClassroomsForStudent(req, res);

    expect(crModel.getStudentAvailableClassroomsToJoin).toHaveBeenCalledTimes(1);
    expect(crModel.getStudentAvailableClassroomsToJoin).toHaveBeenCalledWith("student123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockClassrooms
    });
  });

  it("should return 200 with empty array if no classrooms available", async () => {
    jest
      .spyOn(crModel, "getStudentAvailableClassroomsToJoin")
      .mockResolvedValue([]);

    await getAvailableClassroomsForStudent(req, res);

    expect(crModel.getStudentAvailableClassroomsToJoin).toHaveBeenCalledTimes(1);
    expect(crModel.getStudentAvailableClassroomsToJoin).toHaveBeenCalledWith("student123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: []
    });
  });
});