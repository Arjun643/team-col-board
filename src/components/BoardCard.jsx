import React from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, UsersIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const BoardCard = ({ board, tasks = [], members = [] }) => {
  // Calculate board statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  
  // Get members for this board
  const boardMembers = members.filter(member => 
    member && 
    member.boardIds && 
    Array.isArray(member.boardIds) && 
    member.boardIds.includes(String(board.id))
  );

  // Debug log to check members data
  console.log('Board Members Data:', {
    boardId: board.id,
    allMembers: members,
    filteredMembers: boardMembers,
    memberCount: boardMembers.length
  });

  const lastActivity = board.updatedAt 
    ? formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true }) 
    : 'No activity';

  return (
    <Link
      to={`/board/${board.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
    >
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{board.title}</h3>
        <p className="text-sm text-gray-500 mb-4">{board.description}</p>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Tasks Progress */}
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
            <span>{completedTasks}/{totalTasks} tasks</span>
          </div>
          
          {/* Team Members */}
          <div className="flex items-center text-sm text-gray-600">
            <UsersIcon className="h-5 w-5 mr-2 text-blue-500" />
            <span>{boardMembers.length} member{boardMembers.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Last Activity */}
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span>Last activity {lastActivity}</span>
        </div>
      </div>
    </Link>
  );
};

export default BoardCard; 