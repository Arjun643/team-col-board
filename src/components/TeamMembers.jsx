import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembers, inviteMember, removeMemberFromBoard } from '../store/slices/teamSlice';
import { UserCircleIcon, XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const TeamMembers = ({ boardId }) => {
  const dispatch = useDispatch();
  const { members, loading, error } = useSelector((state) => state.team);
  const [email, setEmail] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    if (boardId) {
      dispatch(fetchMembers(boardId));
    }
  }, [dispatch, boardId]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');

    if (!email) {
      setInviteError('Please enter an email address');
      return;
    }

    try {
      await dispatch(inviteMember(email, boardId));
      setEmail('');
      setShowInviteForm(false);
    } catch (error) {
      setInviteError(error.message);
    }
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      dispatch(removeMemberFromBoard(memberId, boardId));
    }
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Team Members</h3>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserPlusIcon className="h-4 w-4 mr-1" />
            Invite
          </button>
        </div>
        
        {showInviteForm && (
          <div className="mt-4">
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter email address"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Send Invite
                  </button>
                </div>
              </div>
              {inviteError && (
                <p className="mt-2 text-sm text-red-600">{inviteError}</p>
              )}
            </form>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 p-4 rounded-md bg-red-50 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {loading ? (
              <li className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </li>
            ) : members.length === 0 ? (
              <li className="py-4">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  No team members yet
                </div>
              </li>
            ) : (
              members.map((member) => (
                <li key={member.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={member.avatar}
                        alt={member.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{member.email}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status === 'online'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {member.status}
                      </span>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeamMembers; 