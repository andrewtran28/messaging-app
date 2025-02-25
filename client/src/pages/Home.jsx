import { useState } from "react";
import { useAuth } from "../utils/AuthContext";
import UsersList from "../components/UsersList";
import ChatList from "../components/ChatList";
import CreateChat from "../components/CreateChat";
import "../styles/Home.css";

function Home() {
  const { user } = useAuth();
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);

  return (
    <>
      {user && (
        <>
          <ChatList />
        </>
      )}
      <div id="page-layout">
        <div className="user-directory">
          <UsersList />
          {user && (
            <button className="btn-create-chat" onClick={() => setIsAddMembersOpen(true)}>
              Create New Chat
            </button>
          )}

          {isAddMembersOpen && (
            <CreateChat
              currentMembers={[{ userId: user.id, username: user.username }]}
              onClose={() => setIsAddMembersOpen(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
