// Mock course data for frontend development
export const mockCourses = [
  {
    course_id: 1,
    course_code: "C1001",
    course_title: "Cybersecurity",
    total_credits: 3,
    course_instructor: 1,
    date_created: "2024-01-15T10:30:00Z",
    last_updated: "2024-01-20T14:45:00Z",
    status: "published"
  },
  {
    course_id: 2,
    course_code: "C1003", 
    course_title: "Internet of Things",
    total_credits: 4,
    course_instructor: 1,
    date_created: "2024-01-10T09:15:00Z",
    last_updated: "2024-01-18T16:20:00Z",
    status: "published"
  },
  {
    course_id: 3,
    course_code: "C2000",
    course_title: "Web Development", 
    total_credits: 3,
    course_instructor: 1,
    date_created: "2024-01-05T11:00:00Z",
    last_updated: "2024-01-22T13:30:00Z",
    status: "draft"
  },
  {
    course_id: 4,
    course_code: "C2001",
    course_title: "Mobile Application",
    total_credits: 4,
    course_instructor: 1,
    date_created: "2024-01-12T08:45:00Z",
    last_updated: "2024-01-19T15:10:00Z",
    status: "published"
  },
  {
    course_id: 5,
    course_code: "C3004",
    course_title: "Artificial Intelligence",
    total_credits: 4,
    course_instructor: 1,
    date_created: "2024-01-08T14:20:00Z",
    last_updated: "2024-01-21T10:15:00Z",
    status: "draft"
  }
];

// Mock API functions that simulate backend calls
export const mockCourseAPI = {
  // Simulate API delay
  delay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  // Get all courses
  getAllCourses: async () => {
    await mockCourseAPI.delay(800); // Simulate network delay
    return [...mockCourses]; // Return a copy
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    await mockCourseAPI.delay(600);
    const course = mockCourses.find(c => c.course_id === parseInt(courseId));
    if (!course) {
      throw new Error('Course not found');
    }
    return { ...course }; // Return a copy
  },

  // Get courses by instructor
  getCoursesByInstructor: async (instructorId) => {
    await mockCourseAPI.delay(700);
    return mockCourses.filter(c => c.course_instructor === parseInt(instructorId));
  },

  // Create new course
  createCourse: async (courseData) => {
    await mockCourseAPI.delay(1000);
    const newCourse = {
      course_id: mockCourses.length + 1,
      ...courseData,
      date_created: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      status: "draft"
    };
    mockCourses.push(newCourse);
    return { ...newCourse };
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    await mockCourseAPI.delay(800);
    const index = mockCourses.findIndex(c => c.course_id === parseInt(courseId));
    if (index === -1) {
      throw new Error('Course not found');
    }
    mockCourses[index] = {
      ...mockCourses[index],
      ...courseData,
      last_updated: new Date().toISOString()
    };
    return { ...mockCourses[index] };
  },

  // Delete course
  deleteCourse: async (courseId) => {
    await mockCourseAPI.delay(600);
    const index = mockCourses.findIndex(c => c.course_id === parseInt(courseId));
    if (index === -1) {
      throw new Error('Course not found');
    }
    const deletedCourse = mockCourses.splice(index, 1)[0];
    return { ...deletedCourse };
  }
};
