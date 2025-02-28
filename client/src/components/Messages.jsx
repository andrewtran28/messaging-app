import { useState, useEffect, useRef } from "react";
import { formatDateTime } from "../utils/FormatDate";
import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const socket = io(API_BASE_URL, { withCredentials: true });

function Messages({ messages, chatId, user, token, setMessages, members }) {
  const [newMessage, setNewMessage] = useState("");
  const [lastReadMessages, setLastReadMessages] = useState({});
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (user && chatId) socket.emit("join", user.id, chatId);

    const handleReceiveMessage = (messageData) => {
      const formattedMessage = {
        id: messageData.id,
        text: messageData.text,
        createdAt: messageData.createdAt,
        user: {
          id: messageData.senderId,
          username: messageData.senderUsername,
          profileIcon: messageData.senderProfileIcon,
        },
        readReceipts: messageData.readReceipts || [],
      };

      setMessages((prev) => [...prev, formattedMessage]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [user, chatId, setMessages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.id) {
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
    }
  }, [messages, chatId, token]);

  useEffect(() => {
    const updatedLastReadMessages = messages.reduce((acc, message) => {
      message.readReceipts?.forEach((receipt) => {
        acc[receipt.user.id] = message.id;
      });
      return acc;
    }, {});

    setLastReadMessages(updatedLastReadMessages);
  }, [messages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: user.id,
      senderUsername: user.username,
      senderProfileIcon: user.profileIcon,
      text: newMessage.trim(),
      chatId,
    };

    try {
      socket.emit("sendMessage", messageData);
      await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, text: newMessage.trim() }),
      });
      setNewMessage(""); // Clear input field
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
                <li className={`message ${isSender ? "you" : ""}`} key={message.id}>
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
                        .map(([userId]) => {
                          const member = members.find((m) => m.userId === userId);
                          return (
                            <span key={userId}>
                              {member && (
                                <img
                                  className="read-profile"
                                  src={member.user.profileIcon}
                                  title={member.user.username}
                                />
                              )}
                            </span>
                          );
                        })}
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
          autoComplete="off"
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button id="btn-send" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </>
  );
}

export default Messages;
