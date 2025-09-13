import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"; 
import useStore from "../store/index.js";
import api from "../libs/apiCalls.js";  

function Login() {
  // State for switching between login/register forms
  const [form, setForm] = useState("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");
  const [loginResMsg, setLoginMsg] = useState("");

  // Registration state
  const [regEmail, setRegEmail] = useState("");
  const [regPwd, setRegPwd] = useState("");
  const [regResMsg, setRegMsg] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("student");

  // Global store
  const { user, setCredentials } = useStore((state) => state);

  const navigate = useNavigate();

  /** Redirect to courses if already logged in */
  useEffect(() => {
    if (user) {
      setTimeout(() => navigate("/"), 500);
    }
  }, [user, navigate]);

  /** Handle login form submission */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data: res } = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPwd,
      });

      if (res?.user) {
        console.log("Login successful", res.user);
        setLoginMsg(" Login successful");

        const userInfo = { ...res.user, token: res.token };
        localStorage.setItem("user", JSON.stringify(userInfo));
        setCredentials(userInfo);

        // setTimeout(() => navigate("/"), 1000);
      } else {
        setLoginMsg(" No user found");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginMsg(` Login failed: ${error.response?.data?.message || ""}`);
    }
  };

  /** Handle registration form submission */
  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      const { data: res } = await api.post("/auth/register", {
        fname,
        lname,
        pin,
        role,
        email: regEmail,
        password: regPwd,
      });

      if (res?.user) {
        console.log("Registration successful", res.user);
        setRegMsg(" Registration successful");

        const userInfo = { ...res.user, token: res.token };
        localStorage.setItem("user", JSON.stringify(userInfo));
        setCredentials(userInfo);

        // setTimeout(() => navigate("/"), 1000);
      } else {
        setRegMsg(" No user returned");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setRegMsg(` Registration failed: ${error.response?.data?.message || ""}`);
    }
  };

  return (
    <div className="container">
      {/* Logo */}
      <h1 className="logo">
        <span className="logo-gray">LearnTo</span>
        <span className="logo-blue">Go</span>
      </h1>

      {/* Tabs */}
      <div className="tabs">
        <div
          className={`tab ${form === "login" ? "active" : ""}`}
          onClick={() => setForm("login")}
        >
          Login
        </div>
        <div
          className={`tab ${form === "register" ? "active" : ""}`}
          onClick={() => setForm("register")}
        >
          Register
        </div>
      </div>

      {/* Login Form */}
      {form === "login" && (
        <div className="form active">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              required
              style={{ width: "310px" }}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              style={{ width: "310px" }}
              value={loginPwd}
              onChange={(e) => setLoginPwd(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
          {loginResMsg && <p>{loginResMsg}</p>}
        </div>
      )}

      {/* Registration Form */}
      {form === "register" && (
        <div className="form active">
          <h2>Register</h2>
          <form onSubmit={handleRegistration}>
            <input
              type="text"
              placeholder="First Name"
              required
              style={{ width: "310px" }}
              value={fname}
              onChange={(e) => setFname(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              required
              style={{ width: "310px" }}
              value={lname}
              onChange={(e) => setLname(e.target.value)}
            />
            <input
              type="text"
              placeholder="Registration PIN"
              required
              style={{ width: "310px" }}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <select
              required
              style={{ width: "310px" }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
            </select>
            <input
              type="email"
              placeholder="Email"
              required
              style={{ width: "310px" }}
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              style={{ width: "310px" }}
              value={regPwd}
              onChange={(e) => setRegPwd(e.target.value)}
            />
            <button type="submit">Register</button>
          </form>
          {regResMsg && <p>{regResMsg}</p>}
        </div>
      )}
    </div>
  );
}

export default Login;
