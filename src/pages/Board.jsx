import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  setTasks,
  moveTask,
  setLoading,
  setError,
  addTask,
  deleteTask,
} from '../store/slices/tasksSlice';
import { addActivity } from '../store/slices/activitySlice';
import { tasksService } from '../services/tasksService';
import { boardsService } from '../services/boardsService';
import TaskColumn from '../components/TaskColumn';
import TaskCard from '../components/TaskCard';
import TaskDetailsModal from '../components/TaskDetailsModal';
import ChatPanel from '../components/ChatPanel';
import TeamPanel from '../components/TeamPanel';
import ActivityFeed from '../components/ActivityFeed';
import TeamMemberModal from '../components/TeamMemberModal';
import { PlusIcon, UsersIcon, ChatBubbleLeftIcon, BellIcon } from '@heroicons/react/24/outline';

const COLUMN_TYPES = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const Board = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks.tasks[boardId] || []);
  const isLoading = useSelector((state) => state.tasks.loading);
  const error = useSelector((state) => state.tasks.error);
  const [board, setBoard] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activeTab, setActiveTab] = useState('team');

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    const fetchBoardAndTasks = async () => {
      dispatch(setLoading(true));
      try {
        const [boardData, tasksData] = await Promise.all([
          boardsService.getBoard(boardId),
          tasksService.getTasks(boardId)
        ]);
        setBoard(boardData);
        dispatch(setTasks({ boardId, tasks: tasksData }));
        
        // Add initial board loaded activity
        dispatch(addActivity({
          boardId,
          type: 'board',
          action: 'loaded',
          timestamp: new Date().toISOString(),
          userName: 'Arjun Maurya',
          message: 'Board loaded successfully'
        }));
      } catch (err) {
        dispatch(setError(err.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (boardId) {
      fetchBoardAndTasks();
    }
  }, [boardId, dispatch]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const taskId = active.id;
    const fromStatus = tasks.find(t => t.id === taskId)?.status;
    const toStatus = over.id;

    try {
      const updatedTask = await tasksService.moveTask(boardId, taskId, toStatus);
      dispatch(moveTask({
        boardId,
        taskId,
        newStatus: toStatus,
        taskData: updatedTask
      }));
      dispatch(addActivity({
        boardId,
        type: 'task',
        action: 'moved',
        taskId,
        taskTitle: updatedTask.title,
        from: fromStatus,
        to: toStatus,
        timestamp: new Date().toISOString(),
        userId: updatedTask.assignedTo,
        userName: 'Arjun Maurya' // You can get this from auth state
      }));
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await tasksService.createTask(boardId, {
        ...taskData,
        status: COLUMN_TYPES.TODO
      });
      dispatch(addTask({ boardId, task: newTask }));
      dispatch(addActivity({
        boardId,
        type: 'task',
        action: 'created',
        taskId: newTask.id,
        taskTitle: newTask.title,
        timestamp: new Date().toISOString(),
        userId: newTask.assignedTo,
        userName: 'Arjun Maurya' // You can get this from auth state
      }));
      setShowNewTaskModal(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      const updatedTask = await tasksService.updateTask(boardId, taskId, updatedData);
      dispatch(moveTask({
        boardId,
        taskId,
        newStatus: updatedTask.status,
        taskData: updatedTask
      }));
      dispatch(addActivity({
        boardId,
        type: 'task',
        action: 'updated',
        taskId,
        taskTitle: updatedTask.title,
        timestamp: new Date().toISOString(),
        userId: updatedTask.assignedTo,
        userName: 'Arjun Maurya' // You can get this from auth state
      }));
      setShowTaskModal(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const taskToDelete = tasks.find(t => t.id === taskId);
      await tasksService.deleteTask(boardId, taskId);
      dispatch(deleteTask({ boardId, taskId }));
      dispatch(addActivity({
        boardId,
        type: 'task',
        action: 'deleted',
        taskId,
        taskTitle: taskToDelete?.title,
        timestamp: new Date().toISOString(),
        userId: taskToDelete?.assignedTo,
        userName: 'Arjun Maurya' // You can get this from auth state
      }));
      setShowTaskModal(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const toggleTeamPanel = () => {
    setShowTeamPanel(!showTeamPanel);
    setShowChatPanel(false);
    setActiveTab('team');
  };

  const toggleChatPanel = () => {
    setShowChatPanel(!showChatPanel);
    setShowTeamPanel(false);
    setActiveTab('chat');
  };

  const toggleActivityFeed = () => {
    setShowActivityFeed(!showActivityFeed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {board?.title || 'Loading...'}
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              New Task
            </button>
            <button
              onClick={toggleActivityFeed}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                showActivityFeed ? 'text-white bg-indigo-600 hover:bg-indigo-700' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <BellIcon className="-ml-1 mr-2 h-5 w-5" />
              Activity Feed
            </button>
            <button
              onClick={toggleTeamPanel}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                showTeamPanel ? 'text-white bg-indigo-600 hover:bg-indigo-700' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <UsersIcon className="-ml-1 mr-2 h-5 w-5" />
              Team Members
            </button>
            <button
              onClick={toggleChatPanel}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                showChatPanel ? 'text-white bg-indigo-600 hover:bg-indigo-700' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <ChatBubbleLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              Chat
            </button>
          </div>
        </div>

        <div className="flex">
          <div className={`flex-1 ${showActivityFeed ? 'mr-80' : ''}`}>
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-3 gap-4">
                {Object.values(COLUMN_TYPES).map((status) => (
                  <TaskColumn
                    key={status}
                    title={status}
                    tasks={getTasksByStatus(status)}
                    onTaskClick={handleTaskClick}
                  />
                ))}
              </div>
            </DndContext>
          </div>

          {showActivityFeed && (
            <div className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
              <ActivityFeed boardId={boardId} />
            </div>
          )}
        </div>

        {(showTaskModal || showNewTaskModal) && (
          <TaskDetailsModal
            task={selectedTask}
            isOpen={showTaskModal || showNewTaskModal}
            onClose={() => {
              setShowTaskModal(false);
              setShowNewTaskModal(false);
              setSelectedTask(null);
            }}
            initialEditMode={showNewTaskModal}
          />
        )}

        {showChatPanel && (
          <div className="fixed bottom-0 right-0 w-96 h-[600px] mr-4">
            <ChatPanel boardId={boardId} onClose={() => setShowChatPanel(false)} />
          </div>
        )}

        {showTeamPanel && (
          <div className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700">
            <TeamPanel boardId={boardId} onClose={() => setShowTeamPanel(false)} />
          </div>
        )}

        {showTeamModal && (
          <TeamMemberModal
            boardId={boardId}
            onClose={() => setShowTeamModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Board; 