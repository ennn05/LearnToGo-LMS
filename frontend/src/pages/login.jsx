import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"; 
import useStore from "../store/index.js";
import { useEffect } from "react";
import api from "../libs/apiCalls.js";  

function Login() {
  const [form, setForm] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPwd, setRegPwd] = useState("");
  const [loginResMsg, setLoginMsg] = useState("");
  const [regResMsg, setRegMsg] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("student");
  const {user, setCredentials} = useStore((state) => state);

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/courses");
    }
  }, [user]);

  
  // Function to handle login form submission
  const handleLogin = async(e) => {
    e.preventDefault();

    // const res = await fetch("/api/auth/login", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email: loginEmail, password: loginPwd }),
    // });

    // const data = await res.json();
    // if (res.ok) {
    //   console.log("Login successful", data.user);
    //   localStorage.setItem("user", JSON.stringify(data.user));
    //   navigate("/lessons"); // use React Router
    // } else {
    //   setLoginMsg("Invalid email or password");
    // }

    try {

      const { data : res } = await api.post("/auth/login", { email: loginEmail, password: loginPwd });

      if (res?.user)
      {
        console.log("Login successful", res.user);
        setLoginMsg("Login successful");
        const userInfo = {...res.user, token: res.token };
        localStorage.setItem("user", JSON.stringify(userInfo));
        setCredentials(userInfo);
        setTimeout(() => {
          navigate("/courses");
        }, 2000);
      }
      else {
        setLoginMsg("NO  USER?");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginMsg(`❌ Login failed: ${error.response?.data?.message || ''}`);
    }
  };

  const handleRegistration = async(e) => {
    e.preventDefault();

    try {

      const { data : res } = await api.post("/auth/register", { fname: fname, lname: lname, pin: pin, role: role, email: regEmail, password: regPwd });

      if (res?.user)
      {
        console.log("Registration successful", res.user);
        setRegMsg("Registration successful");
        const userInfo = {...res.user, token: res.token };
        localStorage.setItem("user", JSON.stringify(userInfo));
        setCredentials(userInfo);
        setTimeout(() => {
          navigate("/courses");
        }, 1500);
      }
      else {
        setRegMsg("NO  USER?");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setRegMsg(`❌ Registration failed: ${error.response?.data?.message || ''}`);
    }

  };

  return (
    <div className="container">
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

      {form === "login" && (
        <div className="form active">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              required style={{ width: "290px" }}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required style={{ width: "290px" }}
              value={loginPwd}
              onChange={(e) => setLoginPwd(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
          {loginResMsg && <p>{loginResMsg}</p>}
        </div>
      )}

      {form === "register" && (
        <div className="form active">
          <h2>Register</h2>
          <form onSubmit={handleRegistration}>
            <input type="text" placeholder="First Name" required style={{ width: "290px" }} value={fname} onChange={(e) => setFname(e.target.value)}
            />
            <input type="text" placeholder="Last Name" required style={{ width: "290px" }} value={lname} onChange={(e) => setLname(e.target.value)}
            />
            <input type="text" placeholder="Registration PIN" required style={{ width: "290px" }} value={pin} onChange={(e) => setPin(e.target.value)}
            />
            <select placeholder="Select Role" required style={{ width: "290px" }} value={role} onChange={(e) => setRole(e.target.value)}
            >
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
            </select>
            <input type="email" placeholder="Email" required style={{ width: "290px" }} value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
            />
            <input type="password" placeholder="Password" required style={{ width: "290px" }} value={regPwd} onChange={(e) => setRegPwd(e.target.value)}
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