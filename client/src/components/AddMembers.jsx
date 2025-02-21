import { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AddMembers({ currentMembers, onClose, onCreateGroupChat }) {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          setUsers(data);
        } else {
          setErrorMessage(data.message || "Failed to fetch users.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setErrorMessage("An error occurred while fetching users.");
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
    try {
      const allUserIds = [...new Set([...currentMembers.map((member) => member.userId), ...selectedUsers])];

      if (selectedUsers.length === 1 && allUserIds.length <= 2) {
        const otherUserId = selectedUsers[0];

        const checkResponse = await fetch(`${API_BASE_URL}/api/chat/check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recipientId: otherUserId }),
        });

        const checkData = await checkResponse.json();

        if (checkResponse.ok && checkData.chatId) {
          onClose();
          onCreateGroupChat(checkData.chatId);
          return;
        }
      }

      // Create a new chat if a 1-on-1 chat doesn't exist or if it's a group chat
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: allUserIds }),
      });

      const data = await response.json();
      console.log("Chat creation response:", data); // Debugging

      if (response.ok && data.id) {
        onClose();
        onCreateGroupChat(data.id);
      } else {
        setErrorMessage(data.message || "Failed to create group chat.");
      }
    } catch (error) {
      console.error("Error creating group chat:", error);
      setErrorMessage("An error occurred while creating the group chat.");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !currentMembers.some((member) => member.userId === user.id)
  );

  return (
    <div className="add-members-modal">
      <h2>Create New Chat</h2>

      <input
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

      <button onClick={handleCreateChat}>Create Chat</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}

export default AddMembers;
