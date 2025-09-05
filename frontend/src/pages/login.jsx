import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"; 

function Login() {
  const [form, setForm] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("student");

  const navigate = useNavigate();

  const handleLogin = async(e) => {
    e.preventDefault();
    
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log("Login successful", data.user);
      navigate("/dashboard"); // use React Router
    } else {
      setMessage("❌ Invalid email or password");
    }
  };

  const handleRegistration = async(e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fname, lname, pin, role, email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log("Registration successful", data.user);
      navigate("/dashboard"); // use React Router
    } else {
      setMessage("❌ Registration failed");
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required style={{ width: "290px" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
          {message && <p>{message}</p>}
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
            <input type="email" placeholder="Email" required style={{ width: "290px" }} value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <input type="password" placeholder="Password" required style={{ width: "290px" }} value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Register</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;