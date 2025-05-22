import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { formatDateTime } from "../utils/FormatDate";
import "../styles/ChatList.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type User = {
  id: string | number;
  username: string;
  profileIcon: string;
};

type Chat = {
  id: string;
  isGroup: boolean;
  chatName: string;
  members: User[];
  lastMessage: string | null;
  lastMessageSender: string | null;
  lastMessageReadBy: string[];
  lastMessageAt: string;
};

function ChatList() {
  const { user, token } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      setErrorMessage("You must be logged in to view chats.");
      setLoading(false);
      return;
    }

    const showLoadingTimer = setTimeout(() => setShowLoading(true), 1000);

    const fetchChats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch chats.");

        setChats(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
        if (error instanceof Error) {
          setErrorMessage(error.message || "An error occurred while fetching chats.");
        } else {
          setErrorMessage("An unknown error occurred while fetching chats.");
        }
      } finally {
        setLoading(false);
        setShowLoading(false);
      }
    };

    fetchChats();
    return () => clearTimeout(showLoadingTimer);
  }, [user, token]);

  const truncateMessage = (message: string | null, maxLength = 30) => {
    if (!message) return "No messages yet";
    return message.length > maxLength ? message.slice(0, maxLength) + "..." : message;
  };

  const truncateName = (name: string | null, maxLength = 25) => {
    if (!name) return "Unnamed Group";
    return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
  };

  if (loading) {
    return (
      <>
        <section className="chatlist">
          <h2>Your Chats</h2>
          {showLoading && (
            <>
              <div className="loading-wrapper">
                <div className="loading">
                  <span>Loading Chats</span>
                  <span className="load-animation">...</span>
                </div>
              </div>
            </>
          )}
        </section>
      </>
    );
  }

  return (
    <section className="chatlist">
      <h2>Your Chats</h2>
      {errorMessage && (
        <p className="error" style={{ color: "red" }}>
          {errorMessage}
        </p>
      )}

      <div className="chats">
        {chats.length === 0 ? (
          <p className="no-chats">You have no active chats.</p>
        ) : (
          <ul>
            {chats.map((chat) => {
              if (!chat) return null;

              const isUnread = chat.lastMessage && !chat.lastMessageReadBy?.includes(String(user!.id));
              const otherParticipant = !chat.isGroup ? chat.members.find((member) => member.id !== user!.id) : null;

              return (
                <li key={chat.id} className="chat">
                  {!chat.isGroup && otherParticipant ? (
                    <img className="chatlist-profile" src={otherParticipant.profileIcon} />
                  ) : (
                    <img className="chatlist-profile" src={"/profile/group-chat.png"} />
                  )}
                  <div className="chat-info">
                    <Link to={`/chat/${chat.id}`}>
                      <span className="chat-name">
                        {chat.isGroup ? truncateName(chat.chatName) : otherParticipant?.username || "Unnamed Chat"}
                      </span>
                    </Link>
                    <p
                      className="chat-preview"
                      style={{ color: isUnread ? "black" : "inherit", fontWeight: isUnread ? "600" : "400" }}
                    >
                      {chat.lastMessageSender && `${chat.lastMessageSender}: `}
                      {truncateMessage(chat.lastMessage)}
                    </p>
                  </div>
                  <span className="timestamp">{formatDateTime(chat.lastMessageAt)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export default ChatList;
