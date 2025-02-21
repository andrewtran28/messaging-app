import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function UsersList() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [hoveredUser, setHoveredUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        const data = await response.json();
        if (response.ok) {
          setUsers(data);
          setFilteredUsers(data);
        } else {
          setErrorMessage(data.message || "Failed to fetch users.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setErrorMessage("An error occurred while fetching users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleChat = async (otherUserId) => {
    try {
      if (!user || !token) {
        setErrorMessage("You must be logged in to start a chat.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: otherUserId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to check chat existence.");
      }

      const chatId = data.chatId || (await createChat(otherUserId));
      if (chatId) navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Chat error:", error);
      setErrorMessage(error.message || "An error occurred while starting a chat.");
    }
  };

  const createChat = async (otherUserId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: [user.id, otherUserId] }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create a new chat.");
      }

      return data.chatId;
    } catch (error) {
      console.error("Error creating chat:", error);
      setErrorMessage(error.message || "An error occurred while creating a chat.");
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <section>
      <h2>List of Users</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search by username..."
      />

      {errorMessage && <p className="error" style={{ color: "red" }}>{errorMessage}</p>}

      {filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="user-list">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="user"
              onMouseEnter={() => setHoveredUser(u.id)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              <span>
                <Link to={`/user/${u.username}`}>{u.username}</Link>
              </span>
              <span>({u.firstName} {u.lastName})</span>
              {user && user.id !== u.id && hoveredUser === u.id && (
                <button className="chat-btn" onClick={() => handleChat(u.id)}>
                  Chat
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default UsersList;
