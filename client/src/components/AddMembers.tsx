import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
};

type AddMembersProps = {
  chatId: string;
  isGroup: boolean;
  currentMembers: { userId: string; username: string }[];
  onClose: () => void;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AddMembers({ chatId, isGroup, currentMembers, onClose }: AddMembersProps) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setErrorMessage("An error occurred while fetching users.");
      }
    };

    fetchUsers();
  }, [token]);

  const handleCheckboxChange = (userId: string) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId) ? prevSelected.filter((id) => id !== userId) : [...prevSelected, userId]
    );
  };

  const handleCreateChat = async () => {
    try {
      const allUserIds = [...new Set([...currentMembers.map((member) => member.userId), ...selectedUsers])];
      let response, data;

      if (isGroup) {
        response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/add-members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: selectedUsers }),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: allUserIds }),
        });
      }

      data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to process chat request.");

      onClose();
      isGroup ? window.location.reload() : navigate(`/chat/${data.id}`);
    } catch (error) {
      console.error("Error creating or updating chat:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message || "An error occurred while processing the chat request.");
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !currentMembers.some((member) => member.userId === user.id)
  );

  return (
    <div className="add-members">
      <h2>{isGroup ? "Add Members to Group" : "Create Group Chat"}</h2>

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
          {isGroup ? "Add Member(s)" : "Create Chat"}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default AddMembers;
