import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { assignTask, unassignTask, updateTask, deleteTask } from '../store/slices/tasksSlice';
import { tasksService } from '../services/tasksService';
import MemberAvatar from './MemberAvatar';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskDetailsModal from './TaskDetailsModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import {
  ClockIcon,
  UserCircleIcon,
  ChatBubbleLeftIcon,
  TagIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const TaskCard = ({ task, isDragging }) => {
  const dispatch = useDispatch();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { members = [] } = useSelector((state) => state.team || { members: [] });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      column: task.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };

  const assignedMember = members.find(m => m.id === task.assignedTo);

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditMode(true);
    setShowDetailsModal(true);
  };

  const handleCardClick = () => {
    setIsEditMode(false);
    setShowDetailsModal(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!task.boardId) {
      console.error('Missing boardId for task:', task);
      return;
    }

    try {
      // First delete from service
      await tasksService.deleteTask(task.boardId, task.id);
      
      // Then update Redux store
      dispatch(deleteTask({ boardId: task.boardId, taskId: task.id }));
      
      console.log('Task deleted successfully');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const taskDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (taskDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (taskDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return taskDate.toLocaleDateString();
  };

  const handleModalClose = () => {
    setShowDetailsModal(false);
    setIsEditMode(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleCardClick}
        className={`
          bg-white dark:bg-gray-700 rounded-lg shadow p-4 cursor-pointer
          hover:shadow-md transition-shadow duration-200 relative
          ${isDragging ? 'shadow-lg ring-2 ring-indigo-500 ring-opacity-50' : ''}
        `}
      >
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={handleEditClick}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex justify-between items-start mb-2 pr-16">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {task.title}
          </h4>
          {task.priority && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
              >
                <TagIcon className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{formatDate(task.createdAt || Date.now())}</span>
            </div>
            {task.deadline && (
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>Due: {formatDate(task.deadline)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {task.assignedTo && assignedMember ? (
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-600 rounded-full px-2 py-1">
                {assignedMember.avatar ? (
                  <img
                    src={assignedMember.avatar}
                    alt={assignedMember.name}
                    className="h-5 w-5 rounded-full"
                  />
                ) : (
                  <div 
                    className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium"
                  >
                    {assignedMember.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[100px]">
                  {assignedMember.name || assignedMember.email}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-gray-400 dark:text-gray-500">
                <UserCircleIcon className="h-5 w-5" />
                <span className="text-xs">Unassigned</span>
              </div>
            )}

            {task.comments?.length > 0 && (
              <div className="flex items-center">
                <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetailsModal && (
        <TaskDetailsModal
          task={task}
          onClose={handleModalClose}
          initialEditMode={isEditMode}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          title={`Delete Task: ${task.title}`}
        />
      )}
    </>
  );
};

export default TaskCard; 