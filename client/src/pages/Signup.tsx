import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileModal from "../components/ProfileModal";
import "../styles/Login.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Signup() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileIcon, setProfileIcon] = useState<string>("/profile/default.png");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleProfileIconChange = (icon: string) => {
    setProfileIcon(icon);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          firstName,
          lastName,
          password,
          confirmPassword,
          profileIcon,
        }),
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
        <ProfileModal profileIcon={profileIcon} handleProfileIconChange={handleProfileIconChange} />

        <label>Username:</label>
        <input
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={30}
          required
        />

        <label>First Name:</label>
        <input
          name="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          maxLength={30}
          required
        />

        <label>Last Name:</label>
        <input
          name="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          maxLength={30}
          required
        />

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

        <button type="submit" id="btn-login">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;
