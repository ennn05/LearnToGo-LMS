import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="Dashboard" element={<Dashboard />} />
      </Routes>
  );
}

export default App;