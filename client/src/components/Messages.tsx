import { useState, useEffect, useRef } from "react";
import { formatDateTime } from "../utils/FormatDate";
import { io } from "socket.io-client";

import type { User, ChatMember, Message } from "../types/models";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const socket = io(API_BASE_URL, { withCredentials: true });

type MessagesProps = {
  messages: Message[];
  chatId: string;
  user: User | null;
  token: string | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  members: ChatMember[];
};

function Messages({ messages, chatId, user, token, setMessages, members }: MessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const [lastReadMessages, setLastReadMessages] = useState<Record<string, string>>({});
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && chatId) socket.emit("join", chatId);

    const handleReceiveMessage = (messageData: any) => {
      const formattedMessage: Message = {
        id: messageData.id,
        text: messageData.text,
        createdAt: messageData.createdAt,
        user: {
          id: messageData.senderId,
          username: messageData.senderUsername,
          profileIcon: messageData.senderProfileIcon,
          firstName: messageData.senderFirstName,
          lastName: messageData.senderLastName,
        },
        senderId: messageData.senderId, // Make sure this is included
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
          const err = error as Error;
          console.error("Error sending read receipt:", err.message);
        }
      };

      sendReadReceipt();
    }
  }, [messages, chatId, token]);

  useEffect(() => {
    const updatedLastReadMessages = messages.reduce((acc: Record<string, string>, message) => {
      message.readReceipts?.forEach((receipt: { user: User }) => {
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
    if (!user) return null;

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
      const err = error as Error;
      console.error("Error sending message:", err.message);
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
              if (!user) return null;

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
          maxLength={2048}
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
