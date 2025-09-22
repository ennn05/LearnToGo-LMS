import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import Login from "./pages/login";
import Lessons from "./pages/lessons";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import CreateCourse from "./pages/CreateCourse";
import Students from "./pages/students";
import { setAuthToken } from "./libs/apiCalls";
import useStore from "./store";
import LessonDetails from "./pages/LessonDetails";
import Classrooms from "./pages/classrooms";
import ClassroomDetails from "./pages/ClassroomDetails";
import CreateClassroom from "./pages/CreateClassroom";
import ClassroomGrade from "./pages/ClassroomGrade";
import EditCourse from "./pages/EditCourse";

const RootLayout = () => {
  const user = useStore((state) => state.user);
  console.log(user)

  setAuthToken(user?.token ?? "");

  return !user ? <Navigate to="/login" replace={true} /> : (
    <Outlet />
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const user = useStore((state) => state.user);
  console.log(user)

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.user_role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <h1>403 - Unauthorized</h1>
      <p>You don't have permission to view this page.</p>
      <button onClick={() => navigate("/")}>Go Back Home</button>
    </div>
  );
}

function App() {
  return (
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Navigate to="/courses" />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/courses/:courseId/edit" element={<EditCourse />} />
          <Route path="/courses/create" element={<CreateCourse />} />
          <Route path="/students" element={<ProtectedRoute allowedRoles={["instructor", "admin"]}><Students /></ProtectedRoute>} />
          <Route path="/lessons/:lessonId" element={<LessonDetails />} />
          <Route path="/classrooms/create" element={<CreateClassroom />} />  
          <Route path="/classrooms/:classroomId" element={<ClassroomDetails />} />
          <Route path="/classrooms/:classroomId/grades" element={<ClassroomGrade />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}

        {/* classroom */}
        <Route path="/classrooms" element={<Classrooms />} />
      </Routes>
  );
}

export default App;