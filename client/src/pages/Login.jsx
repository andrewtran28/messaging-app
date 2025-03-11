import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import "../styles/Login.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token); // Store token in sessionStorage
        navigate("/"); // Redirect to home
      } else {
        setErrorMessage(data.message);
        setUsername("");
        setPassword("");
      }
    } catch (error) {
      console.error("Network error:", error);
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div id="login">
      <h1 id="title">Log In</h1>
      <form onSubmit={handleLogin}>
        <label name="username">Username: </label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} maxLength="30" required />

        <label name="password"> Password: </label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <br />
        {errorMessage && (
          <span style={{ color: "red" }}>
            {errorMessage}
            <br />
          </span>
        )}
        <button type="submit" id="btn-login">
          Log In
        </button>
      </form>
    </div>
  );
}

export default Login;
