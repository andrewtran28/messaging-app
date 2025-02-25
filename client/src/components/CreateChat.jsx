import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function CreateChat({ currentMembers, onClose }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch users.");

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setErrorMessage(error.message);
      }
    };

    fetchUsers();
  }, [token]);

  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId) ? prevSelected.filter((id) => id !== userId) : [...prevSelected, userId]
    );
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return; // Prevents execution if no user is selected

    try {
      const allUserIds = [...new Set([...currentMembers.map((member) => member.userId), ...selectedUsers])];

      if (selectedUsers.length === 1 && allUserIds.length <= 2) {
        const checkResponse = await fetch(`${API_BASE_URL}/api/chat/check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recipientId: selectedUsers[0] }),
        });

        const checkData = await checkResponse.json();
        if (checkResponse.ok && checkData.chatId) {
          onClose();
          return onCreateGroupChat(checkData.chatId);
        }
      }

      // Create a new chat
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: allUserIds }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create chat.");

      onClose();
      navigate(`/chat/${data.id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      setErrorMessage(error.message);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !currentMembers.some((member) => member.userId === user.id)
  );

  return (
    <div className="add-members">
      <h2>Create New Chat</h2>

      <input
        className="search"
        type="text"
        placeholder="Search users"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {errorMessage && <p className="error">{errorMessage}</p>}

      <ul>
        {filteredUsers.length === 0 ? (
          <p>No users found</p>
        ) : (
          filteredUsers.map((user) => (
            <li key={user.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                />
                {user.username} ({user.firstName} {user.lastName})
              </label>
            </li>
          ))
        )}
      </ul>

      <div>
        <button onClick={handleCreateChat} disabled={selectedUsers.length === 0}>
          Create Chat
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default CreateChat;
