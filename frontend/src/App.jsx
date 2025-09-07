import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Lessons from "./pages/Lessons";
import Students from "./pages/students";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/students" element={<Students />} />
      </Routes>
    </Router>
  );
}

export default App;