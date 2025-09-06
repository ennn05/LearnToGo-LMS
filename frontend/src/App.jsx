import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/login";
import Lessons from "./pages/lessons";
import Courses from "./pages/courses";
import Students from "./pages/students";
import { setAuthToken } from "./libs/apiCalls";
import useStore from "./store";

const RootLayout = () => {
  const user = useStore((state) => state.user);
  console.log(user)

  setAuthToken(user?.token ?? "");

  return !user ? <Navigate to="/login" replace={true} /> : (
    <div>
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
        </Route>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<Register />} /> */}
      </Routes>
  );
}

export default App;