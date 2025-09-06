import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Lessons from "./pages/Lessons";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/lessons" element={<Lessons />} />
      </Routes>
    </Router>
  );
}

export default App;