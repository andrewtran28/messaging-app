import { useState, useEffect, useRef } from "react";
import { formatDateTime } from "../utils/FormatDate";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Messages({ messages, chatId, user, token, setMessages }) {
  const [newMessage, setNewMessage] = useState("");
  const [lastReadMessages, setLastReadMessages] = useState({});
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    const sendReadReceipt = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages/${lastMessage.id}/read-receipt`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Error sending read receipt:", error.message);
      }
    };

    sendReadReceipt();
  }, [messages, chatId, token]);

  useEffect(() => {
    const updatedLastReadMessages = {};

    messages.forEach((message) => {
      message.readReceipts?.forEach((receipt) => {
        updatedLastReadMessages[receipt.user.id] = message.id;
      });
    });

    setLastReadMessages(updatedLastReadMessages);
  }, [messages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, text: newMessage.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send message.");

      setMessages((prev) => [...prev, data.message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  return (
    <>
      <div className="messages-cont" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          <ul>
            {messages.map((message, index) => {
              const isSender = message.user.id === user.id;
              const isLastMessage = index === messages.length - 1;
              const isLastReadForUser = Object.values(lastReadMessages).includes(message.id);

              return (
                <li 
                  className={`message ${isSender ? "you" : ""}`} 
                  key={message.id}
                >
                  <div className="message-content">
                    <strong>{isSender ? "You" : message.user.username}:</strong> {message.text}
                    <span className={`message-time ${isLastMessage ? "visible" : "hidden"}`}>
                      {formatDateTime(message.createdAt)}
                    </span>
                  </div>

                  {isLastReadForUser && (
                    <div className="user-read">
                      {Object.entries(lastReadMessages)
                        .filter(([_, msgId]) => msgId === message.id)
                        .map(([userId]) => (
                          <span key={userId}>{messages.find((m) => m.user.id === userId)?.user.username} </span>
                        ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="message-input">
        <input 
          id="input-text"
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          maxLength="2048"
          placeholder="Aa"
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} 
        />
        <button id="btn-send" onClick={handleSendMessage}>Send</button>
      </div>
    </>
  );
}

export default Messages;
