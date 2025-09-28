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
});