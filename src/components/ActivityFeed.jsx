import React from 'react';
import { useSelector } from 'react-redux';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  ChatBubbleLeftIcon,
  PlusIcon,
  ArrowPathIcon,
  TrashIcon,
  UserPlusIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';

const ActivityFeed = ({ boardId, onClose }) => {
  const activities = useSelector((state) => {
    console.log('Redux State:', state);
    console.log('BoardId:', boardId);
    console.log('Activity State:', state?.activity);
    console.log('Board Activities:', state?.activity?.activities[boardId]);
    
    if (!state || !state.activity) {
      console.error('Activity state is missing:', state);
      return [];
    }
    return state.activity.activities[boardId] || [];
  });
  
  const loading = useSelector((state) => state?.activity?.loading || false);
  const error = useSelector((state) => state?.activity?.error || null);

  const getActivityIcon = (type, action) => {
    switch (type) {
      case 'task':
        switch (action) {
          case 'created':
            return <PlusIcon className="h-5 w-5 text-green-500" />;
          case 'updated':
            return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
          case 'deleted':
            return <TrashIcon className="h-5 w-5 text-red-500" />;
          case 'moved':
            return <ArrowPathIcon className="h-5 w-5 text-yellow-500" />;
          default:
            return null;
        }
      case 'board':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
      case 'chat':
        return <ChatBubbleLeftIcon className="h-5 w-5 text-purple-500" />;
      case 'member':
        return action === 'joined' ? 
          <UserPlusIcon className="h-5 w-5 text-green-500" /> : 
          <UserMinusIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActivityMessage = (activity) => {
    const { type, action, taskTitle, userName, from, to, message } = activity;
    
    switch (type) {
      case 'task':
        switch (action) {
          case 'created':
            return `${userName} created task "${taskTitle}"`;
          case 'updated':
            return `${userName} updated task "${taskTitle}"`;
          case 'deleted':
            return `${userName} deleted task "${taskTitle}"`;
          case 'moved':
            return `${userName} moved task "${taskTitle}" from ${from} to ${to}`;
          default:
            return 'Task action performed';
        }
      case 'board':
        return message || `${userName} performed board action: ${action}`;
      case 'chat':
        return `${userName} sent a new message`;
      case 'member':
        return `${userName} ${action} the board`;
      default:
        return message || 'Activity performed';
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading activities: {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Feed</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center">No activities yet</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 text-sm"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type, activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white">
                    {getActivityMessage(activity)}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed; 