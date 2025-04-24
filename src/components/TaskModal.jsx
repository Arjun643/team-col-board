import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { 
  addTask,
  updateTask,
  deleteTask,
  setLoading,
  setError,
  createTaskAsync,
  updateTaskAsync,
  deleteTaskAsync 
} from '../store/slices/tasksSlice';
import { fetchMembers } from '../store/slices/teamSlice';
import { tasksService } from '../services/tasksService';
import { XMarkIcon, UserCircleIcon, TagIcon, CalendarIcon, FlagIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { addActivity } from '../store/slices/activitySlice';

const TaskModal = ({ isOpen, onClose, boardId: propsBoardId, task = null }) => {
  const dispatch = useDispatch();
  const { boardId: urlBoardId } = useParams();
  const currentBoard = useSelector((state) => state.boards.currentBoard);
  
  // Get boardId from props, URL, or current board
  const boardId = propsBoardId || urlBoardId || currentBoard?.id;
  
  console.log('TaskModal - boardId sources:', {
    propsBoardId,
    urlBoardId,
    currentBoardId: currentBoard?.id,
    finalBoardId: boardId
  });

  const { members = [], loading } = useSelector((state) => state.team || { members: [], loading: false });
  
  console.log('URL boardId:', urlBoardId);
  console.log('Props boardId:', propsBoardId);
  console.log('Current board:', currentBoard);
  console.log('Using boardId:', boardId);
  console.log('Members:', members);

  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [status, setStatus] = useState(task ? task.status : 'Todo');
  const [priority, setPriority] = useState(task ? task.priority : 'low');
  const [deadline, setDeadline] = useState(task ? task.deadline : new Date().toISOString().split('T')[0]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(task ? task.tags : []);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(task ? members.find(m => m.id === task.assignedTo) : null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);

  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: '',
    status: ''
  });

  useEffect(() => {
    if (!boardId) {
      setErrors({ ...errors, boardId: 'Invalid board ID. Please try again.' });
      return;
    }
    dispatch(fetchMembers());
  }, [dispatch, boardId]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'Todo');
      setPriority(task.priority || 'low');
      setDeadline(task.deadline || '');
      setTags(task.tags || []);
      if (task.assignedTo) {
        setSelectedAssignee(members.find(m => m.id === task.assignedTo));
      }
    }
  }, [task, members]);

  const boardMembers = useMemo(() => {
    if (!Array.isArray(members)) {
      return [];
    }
    
    return members.filter(member => {
      if (!member?.boardIds) return false;
      return member.boardIds.includes(boardId);
    });
  }, [members, boardId]);

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return boardMembers;
    return boardMembers.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [boardMembers, searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setTitle(value);
    } else if (name === 'description') {
      setDescription(value);
    } else if (name === 'status') {
      setStatus(value);
    } else if (name === 'priority') {
      setPriority(value);
    } else if (name === 'deadline') {
      setDeadline(value);
    }
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    // Title validation
    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    } else if (title.trim().length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }

    // Description validation
    if (!description.trim()) {
      errors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }

    // Deadline validation
    if (!deadline) {
      errors.deadline = 'Deadline is required';
    } else {
      const selectedDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.deadline = 'Deadline cannot be in the past';
      }
    }

    // Priority validation
    if (!priority) {
      errors.priority = 'Priority is required';
    }

    // Status validation
    if (!status) {
      errors.status = 'Status is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    if (!boardId) {
      console.error('Missing boardId. Available values:', {
        propsBoardId,
        urlBoardId,
        currentBoardId: currentBoard?.id
      });
      setErrors({ boardId: 'Board ID is required. Please try refreshing the page.' });
      setIsLoading(false);
      return;
    }

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        status: status || 'Todo',
        priority,
        deadline: deadline || null,
        tags,
        assignedTo: selectedAssignee?.id || null,
        assigneeName: selectedAssignee?.name || null,
        assigneeEmail: selectedAssignee?.email || null,
        boardId: boardId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Submitting task with data:', taskData);

      if (task) {
        await dispatch(updateTaskAsync({ 
          boardId: task.boardId, 
          taskId: task.id, 
          taskData 
        })).unwrap();
        
        dispatch(addActivity({
          boardId: task.boardId,
          type: 'task_update',
          data: {
            taskId: task.id,
            taskTitle: title,
            changes: ['Task details updated']
          },
          timestamp: new Date().toISOString()
        }));
      } else {
        console.log('Creating new task with data:', taskData);
        const result = await dispatch(createTaskAsync(taskData)).unwrap();
        console.log('Task created:', result);
        
        if (result) {
          dispatch(addActivity({
            boardId: task.boardId,
            type: 'task_create',
            data: {
              taskId: result.id,
              taskTitle: title
            },
            timestamp: new Date().toISOString()
          }));
        }
      }
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      setErrors({ 
        general: error.message || 'An error occurred while saving the task.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await dispatch(deleteTaskAsync({ boardId, taskId: task.id })).unwrap();
      dispatch(addActivity({
        boardId,
        type: 'task_delete',
        data: {
          taskId: task.id,
          taskTitle: task.title
        },
        timestamp: new Date().toISOString()
      }));
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
      setErrors({ ...errors, general: error.message || 'An error occurred while deleting the task.' });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSelectAssignee = (member) => {
    setSelectedAssignee(member);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const renderAssigneeSection = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Assign To
      </label>
      <div className="relative">
        <div
          className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {selectedAssignee ? (
            <>
              {selectedAssignee.avatar ? (
                <img
                  src={selectedAssignee.avatar}
                  alt={selectedAssignee.name}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                  {selectedAssignee.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="flex-1">{selectedAssignee.name}</span>
            </>
          ) : (
            <>
              <UserCircleIcon className="h-6 w-6 text-gray-400" />
              <span className="text-gray-500">Assign to someone</span>
            </>
          )}
        </div>

        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg">
            <div className="p-2">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSelectedAssignee(member);
                      setShowDropdown(false);
                      setSearchTerm('');
                    }}
                  >
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No members found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        validationErrors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.title && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        validationErrors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        validationErrors.priority ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select Priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    {validationErrors.priority && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.priority}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                      Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="deadline"
                      name="deadline"
                      value={deadline}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDeadline(e.target.value)}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        validationErrors.deadline ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.deadline && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.deadline}</p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Assignee
                    </label>
                    <div className="mt-1">
                      {selectedAssignee ? (
                        <div className="flex items-center space-x-2">
                          <UserCircleIcon className="h-5 w-5 text-gray-400" />
                          <span>{selectedAssignee.name}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedAssignee(null)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowMembersList(!showMembersList)}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                          <UserCircleIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                          Assign member
                        </button>
                      )}
                    </div>

                    {showMembersList && (
                      <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                        <div className="p-2">
                          <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <ul className="max-h-60 overflow-auto py-1">
                          {filteredMembers.map((member) => (
                            <li
                              key={member.id}
                              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                              onClick={() => handleSelectAssignee(member)}
                            >
                              <div className="flex items-center">
                                <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                                <span>{member.name}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagKeyDown}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter tags and press Enter"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Error message */}
                  {errors.general && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Error
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            {errors.general}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-2 sm:text-sm"
                    >
                      {isLoading ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>

                  {task && (
                    <div className="mt-4 border-t pt-4">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="mr-2 h-5 w-5" />
                        Delete Task
                      </button>
                    </div>
                  )}
                </form>

                {showDeleteConfirm && (
                  <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                      <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                        <div className="sm:flex sm:items-start">
                          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                              Delete Task
                            </Dialog.Title>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Are you sure you want to delete this task? This action cannot be undone.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                            onClick={handleDelete}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Deleting...' : 'Delete'}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default TaskModal; 