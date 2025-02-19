import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Chat() {
  const { chatId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    const fetchChatMembers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          setMembers(data.members);

          // Check if logged-in user is part of the chat
          const isMember = data.members.some((member) => member.id === user.id);
          if (!isMember) {
            navigate("/"); // Redirect if user is not in chat
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

    fetchChatMembers();
  }, [chatId, token, user, navigate]);

  if (loading) return <p>Loading chat...</p>;
  if (errorMessage) return <p>{errorMessage}</p>;

  return (
    <>
      <h2>
        This is the chat between {members.map((member) => member.username).join(" and ")}
      </h2>
    </>
  );
}

export default Chat;
