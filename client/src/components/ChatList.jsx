import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { formatDateTime } from "../utils/FormatDate";

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch chats.");
        }
        
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

  if (loading) return <p>Loading chats...</p>;

  return (
    <section>
      <h2>Your Chats</h2>

      {errorMessage && <p className="error" style={{ color: "red" }}>{errorMessage}</p>}

      {chats.length === 0 ? (
        <p>You have no active chats.</p>
      ) : (
        <ul className="chat-list">
          {chats.map((chat) => (
            <li key={chat.id} className="chat-item">
              <Link to={`/chat/${chat.id}`}>
                <strong>{chat.chatName || "Unnamed Chat"}</strong>
              </Link>
              <p>
                {chat.lastMessageSender && `${chat.lastMessageSender}: `} 
                {chat.lastMessage || "No messages yet"}
              </p>
              <span className="timestamp">
                {formatDateTime(chat.lastMessageAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ChatList;
