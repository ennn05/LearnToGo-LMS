import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"; 

function Login() {
  const [form, setForm] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Function to handle login form submission
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
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/lessons"); // use React Router
    } else {
      setMessage("Invalid email or password");
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
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Name" required style={{ width: "290px" }} />
            <input type="email" placeholder="Email" required style={{ width: "290px" }} />
            <input type="password" placeholder="Password" required style={{ width: "290px" }} />
            <button type="submit">Register</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;