import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import ChatList from "../components/ChatList";
import AddMembers from "../components/AddMembers";
import SeeMembers from "../components/SeeMembers";
import Messages from "../components/Messages";

import seeMembers from "../assets/see-members.png";
import addMembers from "../assets/add-members.png";
import leaveChat from "../assets/leave-chat.png";

import type { ChatMember, Message } from "../types/models";
import "../styles/Chat.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Chat() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { user, token } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [isSeeMembersOpen, setIsSeeMembersOpen] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    const showLoadingTimer = setTimeout(() => setShowLoading(true), 1000);

    const fetchChat = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch chat details.");

        if (!data.members.some((member: ChatMember) => member.userId === user.id)) return navigate("/");

        setGroupName(data.groupName || "");
        setMembers(data.members);
        setMessages(data.messages);
        setIsGroup(data.isGroup);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
        setShowLoading(false);
      }
    };

    fetchChat();
    return () => clearTimeout(showLoadingTimer);
  }, [chatId, token, user, navigate]);

  const handleRenameChat = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupName: groupName.trim() || null }),
      });

      if (!response.ok) throw new Error("Failed to rename chat.");
      setIsEditingName(false);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred.");
      }
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
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An error has occurred while leaving the chat.");
      }
    }
  };

  if (!user || !token) return null;
  const otherMembers = members.filter((member) => member.userId !== user.id);

  if (loading) {
    return (
      <>
        <div id="chat-page">
          <ChatList />

          <div id="page-layout">
            <div className="chat-cont">
              <div className="chat-header">
                <div className="chat-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h1>
                    <span className="chat-profile"></span>
                    ██████████
                    <span className="chat-full-name">████████</span>
                  </h1>
                </div>
              </div>
              {showLoading && (
                <div className="loading-wrapper">
                  <div className="loading">
                    <span>Loading Messages</span>
                    <span className="load-animation">...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (errorMessage) return <p>{errorMessage}</p>;

  return (
    <div id="chat-page">
      <ChatList />

      <div id="page-layout">
        <div className="chat-cont">
          <div className="chat-header" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className="chat-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isEditingName ? (
                <>
                  <input
                    className="edit-group"
                    type="text"
                    maxLength={30}
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
                  {isGroup ? (
                    <>
                      <h1>
                        {groupName ||
                          (() => {
                            const usernames = otherMembers.map((member) => member.user.username);
                            if (usernames.length <= 3) return usernames.join(", ");
                            return `${usernames.slice(0, 3).join(", ")}... +${usernames.length - 3} Members`;
                          })()}
                      </h1>
                      {isHovered && <button onClick={() => setIsEditingName(true)}>Edit</button>}
                    </>
                  ) : (
                    <>
                      <h1>
                        <img className="chat-profile" src={otherMembers[0].user.profileIcon} />
                        {otherMembers[0].user.username}
                        <span className="chat-full-name">
                          ({otherMembers[0].user.firstName} {otherMembers[0].user.lastName})
                        </span>
                      </h1>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="chat-btns">
              <button onClick={() => setIsSeeMembersOpen(true)}>
                <img className="chat-btn" src={seeMembers} title="See Members" />
              </button>
              <button onClick={() => setIsAddMembersOpen(true)}>
                <img className="chat-btn" src={addMembers} title="+ Add Members" />
              </button>
              {isGroup && (
                <>
                  <button id="btn-leave" onClick={handleLeaveChat}>
                    <img className="chat-btn" src={leaveChat} title="Leave Chat" />
                  </button>
                </>
              )}
            </div>
          </div>
          {isSeeMembersOpen && <SeeMembers members={members} onClose={() => setIsSeeMembersOpen(false)} />}

          {isAddMembersOpen && (
            <AddMembers
              isGroup={isGroup}
              chatId={chatId ?? ""}
              currentMembers={members.map((member) => ({
                userId: member.userId,
                username: member.user.username,
              }))}
              onClose={() => setIsAddMembersOpen(false)}
            />
          )}

          <Messages
            messages={messages}
            chatId={chatId ?? ""}
            user={user}
            token={token}
            setMessages={setMessages}
            members={members}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;
