import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Signup() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, firstName, lastName, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/login");
      } else {
        setErrorMessage(data.message);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Network error:", error);
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div id="login">
      <h1 id="title">Sign Up</h1>
      <form onSubmit={handleSignup}>
        <label>Username:</label>
        <input name="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <br/><br/>
        <label>First Name:</label>
        <input name="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />

        <label>Last Name:</label>
        <input name="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        <br/><br />
        <label>Password:</label>
        <input
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Confirm Password:</label>
        <input
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <br />
        {errorMessage && (
          <span style={{ color: "red" }}>
            {errorMessage}
            <br />
          </span>
        )}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
