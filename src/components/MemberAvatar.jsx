import React from 'react';
import { useSelector } from 'react-redux';

const MemberAvatar = ({ memberId, size = 'md' }) => {
  const member = useSelector((state) =>
    state.members.members.find((m) => m.id === memberId)
  );

  if (!member) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div className="relative group">
      <img
        src={member.avatar}
        alt={member.name}
        className={`${sizeClasses[size]} rounded-full ring-2 ring-white`}
      />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {member.name}
      </div>
    </div>
  );
};

export default MemberAvatar; 