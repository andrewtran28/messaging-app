import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import AddMembers from "../components/AddMembers";
import Messages from "../components/Messages";
import ChatList from "../components/ChatList";
import "../styles/Chat.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Chat() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { user, token } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Track hover state

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    const fetchChat = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to fetch chat details.");

        setGroupName(data.groupName || "");
        setMembers(data.members);
        setMessages(data.messages);
        setIsGroup(data.isGroup);

        if (!data.members.some((member) => member.userId === user.id)) {
          navigate("/");
        }
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId, token, user, navigate]);

  const handleRenameChat = async () => {
    try {
      const updatedName = groupName.trim() || null;
      const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupName: updatedName }),
      });

      if (!response.ok) throw new Error("Failed to rename chat.");

      setGroupName(updatedName || "");
      setIsEditingName(false);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleLeaveChat = async () => {
    if (!window.confirm("Are you sure you want to leave this chat?")) return;

    navigate("/");

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to leave chat.");

      alert(data.message);
    } catch (error) {
      console.error("Error leaving chat:", error);
      setErrorMessage(error.message);
    }
  };

  if (!user || !token) return null;
  const otherMembers = members.filter((member) => member.userId !== user.id);

  if (loading) return <p>Loading chat...</p>;
  if (errorMessage) return <p>{errorMessage}</p>;

  return (
    <>
      <ChatList />

      <div id="page-layout">
        <div className="chat-cont">
          <div className="chat-header" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isEditingName ? (
                <>
                  <input
                    className="edit-group"
                    type="text"
                    maxLength="30"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRenameChat()}
                    autoFocus
                  />
                  <button onClick={handleRenameChat}>Save</button>
                  <button onClick={() => setIsEditingName(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <h1>{groupName || otherMembers.map((member) => member.user.username).join(", ")}</h1>
                  {isGroup && isHovered && <button onClick={() => setIsEditingName(true)}>Edit</button>}
                </>
              )}
            </div>
            <div>
              <button onClick={() => setIsAddMembersOpen(true)}>+ Add Members</button>
              {isGroup && (
                <button id="btn-leave" onClick={handleLeaveChat}>
                  Leave Chat
                </button>
              )}
            </div>
          </div>

          {isAddMembersOpen && (
            <AddMembers
              isGroup={isGroup}
              chatId={chatId}
              currentMembers={members}
              onClose={() => setIsAddMembersOpen(false)}
            />
          )}

          <Messages messages={messages} chatId={chatId} user={user} token={token} setMessages={setMessages} />
        </div>
      </div>
    </>
  );
}

export default Chat;
