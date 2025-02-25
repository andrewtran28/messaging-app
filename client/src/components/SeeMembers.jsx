import { Link } from "react-router-dom";

function SeeMembers({ members, onClose }) {
  return (
    <div className="see-members">
        <h2>Chat Members</h2>
        <ul>
          {members.map((member) => (
            <li key={member.userId}>
              <img className="see-members-profile" src={member.user.profileIcon} />
              <Link to={`/user/${member.user.username}`}>{member.user.username}</Link> ({member.user.firstName} {member.user.lastName})
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Close</button>
    </div>
  );
}

export default SeeMembers;

