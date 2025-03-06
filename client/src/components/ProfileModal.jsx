
import { useState } from "react";
import "../styles/ProfileModal.css";

const profileIcons = [
  "default.png",
  "man.png",
  "woman.png",
  "man2.png",
  "woman2.png",
  "man3.png",
  "woman3.png",
  "man4.png",
  "woman4.png",
];

function ProfileModal({ profileIcon, handleProfileIconChange }) {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div className="profile-selection">
      <img
        className="profile-user"
        src={profileIcon}
        title="Click to change Profile Icon"
        alt="Profile Icon"
        onClick={() => setShowModal(true)}
      />
      <button type="button" id="btn-profile-change" onClick={() => setShowModal(true)}>
        Change Profile Icon
      </button>

      {showModal && (
        <div className={`profile-modal ${setShowModal ? "show" : ""}`}>
        <div className="modal-content">
          <h2>Select a Profile Icon</h2>
          <div className="profile-icons">
            {profileIcons.map((icon) => (
              <img
                key={icon}
                src={`/profile/${icon}`}
                alt={icon}
                className="profile-user"
                onClick={() => {
                  handleProfileIconChange(`/profile/${icon}`);
                  setShowModal(false);
                }}
              />
            ))}
          </div>
          <button className="close-modal" onClick={() => setShowModal(false)}>
            Close
          </button>
        </div>
      </div>
      )}
      
    </div>
  );
}

export default ProfileModal;
