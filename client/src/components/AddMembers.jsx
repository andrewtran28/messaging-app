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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleCreateGroupChat = async () => {
    try {
      // Combine current chat members with the newly selected users
      const allUserIds = [...currentMembers.map((member) => member.userId), ...selectedUsers];

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: allUserIds }),
      });

      const data = await response.json();

      if (response.ok) {
        onCreateGroupChat(data.chatId); // Notify parent to update state
        onClose(); // Close the modal or dialog
      } else {
        setErrorMessage(data.message || "Failed to create group chat.");
      }
    } catch (error) {
      console.error("Error creating group chat:", error);
      setErrorMessage("An error occurred while creating group chat.");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) && !currentMembers.some((member) => member.userId === user.id)
  );

  return (
    <div className="add-members-modal">
      <h2>Add Members</h2>

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

      <button onClick={handleCreateGroupChat}>Create Group Chat</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}

export default AddMembers;
