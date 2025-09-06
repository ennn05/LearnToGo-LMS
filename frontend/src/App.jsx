import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Lessons from "./pages/lessons";
import Courses from "./pages/courses";
import Students from "./pages/students";

const RootLayout = () => {
  const user = null; // Replace with actual user authentication logic

  return !user ? <Navigate to="/login" replace={true} /> : (
    <div>
      <h1>Root Layout</h1>
      <Outlet />
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
          <Route path="/students" element={<Students />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<Register />} /> */}
      </Routes>
  );
}

export default App;