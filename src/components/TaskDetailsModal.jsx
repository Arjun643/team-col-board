import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { updateTask, deleteTask, createTaskAsync } from '../store/slices/tasksSlice';
import { tasksService } from '../services/tasksService';
import { addActivity } from '../store/slices/activitySlice';
import {
  XMarkIcon,
  UserCircleIcon,
  TagIcon,
  CalendarIcon,
  FlagIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const TaskDetailsModal = ({ task, onClose, initialEditMode = false, boardId: propsBoardId }) => {
  const dispatch = useDispatch();
  const { boardId: urlBoardId } = useParams();
  const currentBoard = useSelector((state) => state.boards.currentBoard);
  const { members = [] } = useSelector((state) => state.team || { members: [] });
  
  // Get boardId from props, URL, or current board
  const boardId = propsBoardId || urlBoardId || currentBoard?.id;
  
  const [editedTask, setEditedTask] = useState(task ? {
    ...task,
    tags: task.tags || [],
    deadline: task.deadline || new Date().toISOString().split('T')[0],
    assignedTo: task.assignedTo || ''
  } : {
    title: '',
    description: '',
    status: 'Todo',
    priority: 'low',
    tags: [],
    deadline: new Date().toISOString().split('T')[0],
    assignedTo: '',
    boardId: boardId
  });
  
  const [isEditing, setIsEditing] = useState(initialEditMode || !task);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (task) {
      setEditedTask({
        ...task,
        tags: task.tags || [],
        deadline: task.deadline || new Date().toISOString().split('T')[0],
        assignedTo: task.assignedTo || ''
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name === 'assignee' ? 'assignedTo' : name]: value
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setEditedTask(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSave = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    setError(null);

    try {
      if (!boardId) {
        throw new Error('Board ID is required');
      }

      const taskData = {
        ...editedTask,
        tags: editedTask.tags || [],
        updatedAt: new Date().toISOString(),
        boardId: boardId
      };

      console.log('Saving task with data:', taskData);

      if (task) {
        // Update existing task
        await tasksService.updateTask(task.boardId, task.id, taskData);
        dispatch(updateTask({ 
          boardId: task.boardId, 
          task: taskData 
        }));
        
        dispatch(addActivity({
          boardId,
          type: 'task_update',
          data: {
            taskId: task.id,
            taskTitle: taskData.title,
            changes: ['Task details updated']
          },
          timestamp: new Date().toISOString()
        }));
      } else {
        // Create new task
        console.log('Creating new task with boardId:', boardId);
        const result = await dispatch(createTaskAsync({
          ...taskData,
          boardId: boardId,
          createdAt: new Date().toISOString()
        })).unwrap();
        
        console.log('Task created:', result);
        
        dispatch(addActivity({
          boardId,
          type: 'task_create',
          data: {
            taskId: result.id,
            taskTitle: taskData.title
          },
          timestamp: new Date().toISOString()
        }));
      }

      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setError(error.message || 'An error occurred while saving the task');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!task || !task.boardId || !task.id) {
      console.error('Missing required task data:', task);
      return;
    }

    const deletePayload = {
      boardId: task.boardId,
      taskId: task.id
    };
    console.log('Deleting task with payload:', deletePayload);
    
    try {
      dispatch(deleteTask(deletePayload));
      // Force a refresh of the tasks list
      dispatch({ type: 'tasks/fetchTasksSuccess', payload: { boardId: task.boardId, tasks: [] } });
      console.log('Task deleted successfully');
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {showDeleteConfirm ? (
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 dark:bg-gray-800">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Delete Task</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete this task? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 dark:bg-gray-800">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={editedTask.title}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        value={editedTask.description || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={editedTask.priority}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={editedTask.status}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Assignee
                      </label>
                      <div className="mt-1 relative">
                        <button
                          type="button"
                          onClick={() => setShowMembersList(!showMembersList)}
                          className="relative w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          {editedTask.assignedTo ? (
                            <div className="flex items-center">
                              {members.find(m => m.id === editedTask.assignedTo)?.avatar ? (
                                <img
                                  src={members.find(m => m.id === editedTask.assignedTo)?.avatar}
                                  alt=""
                                  className="h-6 w-6 rounded-full mr-2"
                                />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center mr-2">
                                  <span className="text-white text-sm">
                                    {members.find(m => m.id === editedTask.assignedTo)?.name?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                </div>
                              )}
                              <span>{members.find(m => m.id === editedTask.assignedTo)?.name || 'Unknown member'}</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <UserCircleIcon className="h-6 w-6 mr-2" />
                              <span>Assign to a member</span>
                            </div>
                          )}
                        </button>

                        {showMembersList && (
                          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                            <div className="sticky top-0 z-10 bg-white dark:bg-gray-700 p-2">
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Search members or invite by email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                            
                            {members.length > 0 ? (
                              <div>
                                {members
                                  .filter(member => 
                                    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                  )
                                  .map((member) => (
                                    <div
                                      key={member.id}
                                      className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                      onClick={() => {
                                        setEditedTask(prev => ({ ...prev, assignedTo: member.id }));
                                        setShowMembersList(false);
                                        setSearchTerm('');
                                      }}
                                    >
                                      {member.avatar ? (
                                        <img
                                          src={member.avatar}
                                          alt=""
                                          className="h-6 w-6 rounded-full mr-2"
                                        />
                                      ) : (
                                        <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center mr-2">
                                          <span className="text-white text-sm">
                                            {member.name?.charAt(0).toUpperCase() || '?'}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                          {member.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {member.email}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                No members found
                              </div>
                            )}
                            
                            {searchTerm.includes('@') && (
                              <div className="border-t border-gray-200 dark:border-gray-600">
                                <div
                                  className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                  onClick={() => {
                                    // Here you would typically trigger your email invitation flow
                                    alert(`Invitation email will be sent to ${searchTerm}`);
                                    setSearchTerm('');
                                  }}
                                >
                                  <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-2">
                                    <PlusIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                      Invite {searchTerm}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Send invitation email
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Deadline
                      </label>
                      <input
                        type="date"
                        id="deadline"
                        name="deadline"
                        value={editedTask.deadline}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={editedTask.tags?.join(', ') || ''}
                        onChange={handleTagsChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter tags separated by commas"
                      />
                    </div>

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        onClick={handleSave}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{task.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="mt-4 space-y-4">
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {task.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          >
                            <TagIcon className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                        {task.deadline && (
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {task.assignedTo && (
                        <div className="flex items-center mt-2">
                          <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Assigned to: {members.find(m => m.id === task.assignedTo)?.name || 'Unknown'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Edit Task
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteClick}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        Delete Task
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailsModal; 