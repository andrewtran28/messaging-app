import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function UserList({ users, user, token }) {
  const [friendRequests, setFriendRequests] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchFriendRequests = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/friend-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) setFriendRequests(data);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    };

    const fetchChats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) setChats(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchFriendRequests();
    fetchChats();
  }, [user, token]);

  const sendFriendRequest = async (receiverId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${receiverId}/friends`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setFriendRequests([...friendRequests, { fromUserId: user.id, toUserId: receiverId }]);
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleFriendRequest = async (senderId, action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${senderId}/friends`, {
        method: action === "accept" ? "PATCH" : "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFriendRequests(friendRequests.filter((req) => req.fromUserId !== senderId));
      }
    } catch (error) {
      console.error("Error handling friend request:", error);
    }
  };

  const startChat = async (otherUserId) => {
    const existingChat = chats.find((chat) =>
      chat.members.some((member) => member.id === otherUserId)
    );

    if (existingChat) {
      window.location.href = `/chat/${existingChat.id}`;
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chats`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId1: user.id, userId2: otherUserId }),
        });

        if (response.ok) {
          const newChat = await response.json();
          setChats([...chats, newChat]);
          window.location.href = `/chat/${newChat.id}`;
        }
      } catch (error) {
        console.error("Error starting chat:", error);
      }
    }
  };

  return (
    <div className="user-list">
      {users.map((otherUser) => {
        if (user && otherUser.id === user.id) return null; // Skip current user
        const isPending = friendRequests.some((req) => req.fromUserId === otherUser.id);
        const hasSentRequest = friendRequests.some((req) => req.toUserId === otherUser.id);

        return (
          <div key={otherUser.id} className="user">
            <span>
              <Link to={`/user/${otherUser.username}`}>{otherUser.username}</Link>
            </span>
            <span>({otherUser.firstName} {otherUser.lastName})</span>

            {user && (
              <div className="actions">
                {isPending ? (
                  <>
                    <button onClick={() => handleFriendRequest(otherUser.id, "accept")}>
                      Accept
                    </button>
                    <button onClick={() => handleFriendRequest(otherUser.id, "decline")}>
                      Decline
                    </button>
                  </>
                ) : hasSentRequest ? (
                  <button disabled>Request Sent</button>
                ) : (
                  <button onClick={() => sendFriendRequest(otherUser.id)}>Send Friend Request</button>
                )}
                <button onClick={() => startChat(otherUser.id)}>Chat</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default UserList;
