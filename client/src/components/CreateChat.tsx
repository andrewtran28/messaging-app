import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Member = {
  userId: string;
  username: string;
};

type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
};

type CreateChatProps = {
  currentMembers: Member[];
  onClose: () => void;
};

function CreateChat({ currentMembers, onClose }: CreateChatProps) {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unknown error occurred.");
        }
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

          // return onCreateGroupChat(checkData.chatId); --Not sure why this was here. Used navigate instead.
          navigate(`/chat/${checkData.chatId}`);
          return;
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
      console.error("Error:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
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
