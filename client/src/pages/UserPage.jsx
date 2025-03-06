import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { formatDate } from "../utils/FormatDate";
import ProfileModal from "../components/ProfileModal";
import "../styles/UserPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function UserPage() {
  const { username } = useParams();
  const { user, token, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${username}`);
        const data = await response.json();
        if (response.ok) setUserInfo(data);
      } catch (error) {
        console.error("Error fetching user info:", error);
        setErrorMessage("An error occurred while fetching user info.");
      }
    };

    fetchUserInfo();
  }, [username]);

  const handleProfileIconChange = async (icon) => {
    if (!user || user.username !== username) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileIcon: icon }),
      });

      if (response.ok) {
        setUserInfo((prev) => ({ ...prev, profileIcon: icon }));
      } else {
        console.error("Failed to update profile picture.");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage("Enter your password to delete the account.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${username}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        logout();
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setErrorMessage("An error occurred while deleting your account.");
    } finally {
      setPassword("");
    }
  };

  const handleCancel = () => {
    setShowDeleteForm(false);
    setPassword("");
    setErrorMessage("");
  };

  return (
    <div id="user-page">
      {userInfo ? (
        <>
          <h1 id="title">{user && user.username === username ? "Your Account" : `${userInfo.username}'s Profile`}</h1>
          <div className="user-info">
            <h2>{userInfo.username}</h2>
            {user && user.username === username ? (
              <>
                <ProfileModal profileIcon={userInfo.profileIcon} handleProfileIconChange={handleProfileIconChange} />
                <br />
              </>
            ) : (
              <img src={userInfo.profileIcon} className="profile-icon" />
            )}

            <p>User ID: {userInfo.id}</p>
            <p>
              Name: {userInfo.firstName} {userInfo.lastName}
            </p>
            <p>Joined: {formatDate(userInfo.createdAt)}</p>
          </div>
          <br />
          {user && user.username === username && (
            <>
              <div className="delete-form">
                {!showDeleteForm && (
                  <button className="btn-delete" onClick={() => setShowDeleteForm(true)}>
                    Delete Account
                  </button>
                )}

                {showDeleteForm && (
                  <>
                    <hr />
                    <h3>Confirm Account Deletion</h3>
                    <form onSubmit={handleDeleteAccount}>
                      <p>Enter your password to delete your account.</p>
                      <input
                        className="delete-input"
                        type="password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <div>
                        <button className="btn-delete" type="submit">
                          Delete Account
                        </button>
                        <button type="button" onClick={handleCancel}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <p>{errorMessage || "Loading user info..."}</p>
      )}
    </div>
  );
}

export default UserPage;
