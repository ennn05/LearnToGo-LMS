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

});