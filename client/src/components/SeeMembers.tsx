import { Link } from "react-router-dom";
import type { ChatMember } from "../types/models";

type SeeMembersProps = {
  members: ChatMember[];
  onClose: () => void;
};

function SeeMembers({ members, onClose }: SeeMembersProps) {
  return (
    <div className="see-members">
      <h2>Chat Members</h2>
      <ul>
        {members.map((member: ChatMember) => (
          <li key={member.userId}>
            <img className="see-members-profile" src={member.user.profileIcon} />
            <Link to={`/user/${member.user.username}`}>{member.user.username}</Link> ({member.user.firstName}{" "}
            {member.user.lastName})
          </li>
        ))}
      </ul>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default SeeMembers;
