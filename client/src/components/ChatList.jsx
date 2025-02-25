import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { formatDateTime } from "../utils/FormatDate";
import "../styles/ChatList.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ChatList() {
  const { user, token } = useAuth();
  const [chats, setChats] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      setErrorMessage("You must be logged in to view chats.");
      setLoading(false);
      return;
    }

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
        setErrorMessage(error.message || "An error occurred while fetching chats.");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user, token]);

  const truncateMessage = (message, maxLength = 40) => {
    if (!message) return "No messages yet";
    return message.length > maxLength ? message.slice(0, maxLength) + "..." : message;
  };

  if (loading) return <p>Loading chats...</p>;

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
          <p>You have no active chats.</p>
        ) : (
          <ul>
            {chats.map((chat) => {
              const isUnread = chat.lastMessage && !chat.lastMessageReadBy?.includes(user.id);
              return (
                <li key={chat.id} className="chat">
                  <Link to={`/chat/${chat.id}`}>
                    <span className="chat-name">{chat.chatName || "Unnamed Chat"}</span>
                  </Link>
                  <p
                    className="chat-preview"
                    style={{ color: isUnread ? "black" : "inherit", fontWeight: isUnread ? "600" : "400" }}
                  >
                    {chat.lastMessageSender && `${chat.lastMessageSender}: `}
                    {truncateMessage(chat.lastMessage)}
                  </p>
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
