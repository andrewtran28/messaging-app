import { useState, useEffect, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type UsersListProps = {
  loading: boolean;
  setLoading: (value: boolean) => void;
};

type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileIcon: string;
};

function UsersList({ loading, setLoading }: UsersListProps) {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [showDelayedMessage, setShowDelayedMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowDelayedMessage(true), 3000);

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/users`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch users.");
        setUsers(data);
      } catch (error: unknown) {
        console.error("Error fetching users:", error);
        if (error instanceof Error) {
          setErrorMessage(error.message || "An error occurred while fetching users.");
        } else {
          setErrorMessage("An unknown error occurred while fetching users.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    return () => clearTimeout(timer);
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value.toLowerCase());

  const handleChat = async (otherUserId: string) => {
    if (!user || !token) return setErrorMessage("You must be logged in to start a chat.");

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipientId: otherUserId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to check chat existence.");

      navigate(`/chat/${data.chatId || (await createChat(otherUserId))}`);
    } catch (error: unknown) {
      console.error("Chat error:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message || "An error occurred while starting a chat.");
      } else {
        setErrorMessage("An unknown error occurred while starting a chat.");
      }
    }
  };

  const createChat = async (otherUserId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userIds: [user?.id, otherUserId] }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create chat.");
      return data.id;
    } catch (error: unknown) {
      console.error("Error creating chat:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message || "An error occurred while creating a chat.");
      } else {
        setErrorMessage("An unknown error occurred while creating a chat.");
      }
      return null;
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm) ||
      u.firstName.toLowerCase().includes(searchTerm) ||
      u.lastName.toLowerCase().includes(searchTerm)
  );

  return (
    <section id="userlist-cont">
      <h2>User Directory</h2>
      {loading ? (
        <>
          <p>Loading users...</p>
          {showDelayedMessage && <p>(This may take up to 30 seconds due to slow servers.)</p>}
        </>
      ) : (
        <>
          <input
            className="user-search"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by username"
          />

          {errorMessage && (
            <p className="error" style={{ color: "red" }}>
              {errorMessage}
            </p>
          )}

          <div className="user-list">
            {filteredUsers.length === 0 ? (
              <p>No users found.</p>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="user"
                  onMouseEnter={() => setHoveredUser(u.id)}
                  onMouseLeave={() => setHoveredUser(null)}
                >
                  <div className="user-cont">
                    <img className="user-profile" src={u.profileIcon} />
                    <span className="username">
                      <Link to={`/user/${u.username}`}>{u.username}</Link>
                    </span>
                    <span className="full-name">
                      ({u.firstName} {u.lastName})
                    </span>
                  </div>
                  {user && user.id !== u.id && hoveredUser === u.id && (
                    <button className="user-chat-btn" onClick={() => handleChat(u.id)}>
                      Chat
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default UsersList;
