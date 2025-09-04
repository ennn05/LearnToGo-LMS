import { useState } from "react";
import "../styles/login.css"; // <-- import CSS here

function Login() {
  const [form, setForm] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      console.log("✅ Login successful:", email);
      // redirect later using React Router
    } else {
      console.log("❌ Login failed");
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
          <form onSubmit={handleSubmit}>
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
        </div>
      )}

      {form === "register" && (
        <div className="form active">
          <h2>Register</h2>
          <form>
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