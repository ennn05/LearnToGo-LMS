import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Lessons from "./pages/Lessons";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CourseDetails />} />
      </Routes>
    </Router>
  );
}

export default App;