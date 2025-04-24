import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import TeamMemberModal from './TeamMemberModal';
import { removeMember } from '../store/slices/teamSlice';
import { teamService } from '../services/teamService';

const TeamPanel = ({ boardId, onClose }) => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { members } = useSelector((state) => state.team);
  const boardMembers = members.filter(m => m.boardIds.includes(boardId));

  const handleRemoveMember = async (memberId) => {
    try {
      await teamService.removeMember(memberId, boardId);
      dispatch(removeMember({ memberId, boardId }));
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex h-full flex-col bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
        <button
          onClick={handleClose}
          type="button"
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="p-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex w-full items-center justify-center space-x-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5 text-gray-400" />
            <span>Add Team Member</span>
          </button>
        </div>

        <div className="px-4 pb-4">
          {boardMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6">
              <p className="text-sm text-gray-500">No team members yet</p>
              <p className="mt-1 text-xs text-gray-400">Click the button above to add members</p>
            </div>
          ) : (
            <div className="space-y-3">
              {boardMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="relative">
                    <img
                      src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                      alt={member.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        member.status === 'online' ? 'bg-green-400' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {member.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {member.role}
                    </span>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none"
                      type="button"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        boardId={boardId}
      />
    </div>
  );
};

export default TeamPanel; 