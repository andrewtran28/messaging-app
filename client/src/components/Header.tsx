import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import "../styles/Header.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Header() {
  const { user, logout, token } = useAuth(); // Include token from context
  const [profileIcon, setProfileIcon] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user?.username) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/${user.username}`, {
            headers: {
              Authorization: `Bearer ${token}`, // Add the Authorization header with the token
            },
          });

          if (response.ok) {
            const data = await response.json();
            setProfileIcon(data.profileIcon);
          } else {
            console.error("Failed to fetch user profile icon:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      }
    };

    if (token) {
      fetchUserInfo();
    }
  }, [user, token]);

  return (
    <header>
      <div id="header-cont">
        <div className="header-left">
          <Link to="/" className="logo">
            <img className="logo-img" src="/logo.png" alt="Babble-On logo" />
            <span>Babble-On</span>
          </Link>
        </div>

        <nav>
          {user ? (
            <div className="header-right">
              <span className="header-account">
                {profileIcon && <img className="header-profile" src={profileIcon} />}
                <span>
                  Hello, <Link to={`/user/${user.username}`}>{user.username}</Link>
                </span>
              </span>
              <div className="header-btns">
                <Link to={`/user/${user.username}`}>
                  <button>Your Account</button>
                </Link>
                <button onClick={logout}>Logout</button>
              </div>
            </div>
          ) : (
            <div className="header-right">
              <div>
                <Link to="/login">
                  <button>Login</button>
                </Link>
                <Link to="/signup">
                  <button>Sign Up</button>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
