import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { formatDateTime } from "../utils/FormatDate";
import AddMembers from "../components/AddMembers";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Chat() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { user, token } = useAuth();
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false); // State to control AddMembers modal

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
        if (response.ok) {
          setMembers(data.members);
          setMessages(data.messages);
          const isMember = data.members.some((member) => member.userId === user.id);
          if (!isMember) {
            navigate("/"); // Redirect if the user is not part of the chat
          }
        } else {
          setErrorMessage(data.message || "Failed to fetch chat members.");
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
        setErrorMessage("An error occurred while fetching chat details.");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId, token, user, navigate]);

  if (!user || !token) return null;

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, text: newMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
        setNewMessage("");
      } else {
        setErrorMessage(data.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setErrorMessage("An error occurred while sending the message.");
    }
  };

  const otherMembers = members.filter((member) => member.userId !== user.id);

  const handleCreateGroupChat = (newChatId) => {
    navigate(`/chat/${newChatId}`);
  };

  if (loading) return <p>Loading chat...</p>;
  if (errorMessage) return <p>{errorMessage}</p>;

  return (
    <>
      <h1>{otherMembers.map((member) => member.user.username).join(", ")}</h1>

      <button onClick={() => setIsAddMembersOpen(true)}>Add Members</button>

      {isAddMembersOpen && (
        <AddMembers
          currentMembers={members}
          onClose={() => setIsAddMembersOpen(false)}
          onCreateGroupChat={handleCreateGroupChat}
        />
      )}

      <div>
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          <ul>
            {messages.map((message) => (
              <li key={message.id}>
                <strong>{message.user.username}:</strong> {message.text}
                <span>({formatDateTime(message.createdAt)})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Aa" />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </>
  );
}

export default Chat;
