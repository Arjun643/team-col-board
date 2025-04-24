import React from 'react';
import { useSelector } from 'react-redux';
import memberService from '../services/memberService';

const MemberList = () => {
  const members = useSelector((state) => state.members.members);
  const pendingInvites = useSelector((state) => state.members.invitePending);

  const handleRemoveMember = async (memberId) => {
    try {
      await memberService.removeMember(memberId);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Team Members</h3>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-gray-500 text-center py-4">No team members yet</p>
          )}
        </div>
      </div>

      {pendingInvites.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Pending Invites</h3>
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div
                key={invite.inviteId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-gray-900">{invite.email}</p>
                  <p className="text-sm text-gray-500">
                    Invited {new Date(invite.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm text-yellow-600 font-medium">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList; 