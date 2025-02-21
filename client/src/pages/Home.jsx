import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import UsersList from "../components/UsersList";
import ChatList from "../components/ChatList";
import AddMembers from "../components/AddMembers";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);

  const handleCreateGroupChat = (newChatId) => {
    navigate(`/chat/${newChatId}`);
  };

  return (
    <>
      <ChatList />

      <UsersList />

      <button onClick={() => setIsAddMembersOpen(true)}>Create New Chat</button>

      {isAddMembersOpen && (
        <AddMembers
          currentMembers={[{ userId: user.id, username: user.username }]} // Include logged-in user by default
          onClose={() => setIsAddMembersOpen(false)}
          onCreateGroupChat={handleCreateGroupChat}
        />
      )}
    </>
  );
}

export default Home;
