import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  ClockIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import NewBoardModal from '../components/NewBoardModal';
import { fetchBoards, createBoardStart, createBoardSuccess, createBoardFailure } from '../store/slices/boardsSlice';
import { fetchMembers } from '../store/slices/teamSlice';
import { teamService } from '../services/teamService';
import BoardCard from '../components/BoardCard';
import { boardsService } from '../services/boardsService';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { boards, isLoading } = useSelector((state) => state.boards);
  const { members } = useSelector((state) => state.team);
  const { tasks } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchBoards()).unwrap();
        await dispatch(fetchMembers()).unwrap();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [dispatch]);

  // Calculate statistics
  const totalBoards = boards?.length || 0;
  
  // Count unique members
  const uniqueMembers = members?.reduce((acc, member) => {
    if (member?.boardIds?.length > 0) {
      acc.add(member.id);
    }
    return acc;
  }, new Set());
  const totalMembers = uniqueMembers?.size || 0;
  
  // Count active tasks (tasks in Todo or In Progress)
  const activeTasks = Object.values(tasks).flat().filter(task => 
    task.status === 'Todo' || task.status === 'In Progress'
  ).length;

  // Only count online members who are part of at least one board
  const onlineMembersCount = members?.filter(member => 
    member?.status === 'online' && member?.boardIds?.length > 0
  )?.length || 0;

  const getTasksDueToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Object.values(tasks).flat().filter(task => {
      if (!task?.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    }).length;
  };

  const tasksDueToday = getTasksDueToday();

  const handleCreateBoard = async (boardData) => {
    try {
      dispatch(createBoardStart());
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      if (!currentUser) {
        throw new Error('User not found. Please log in again.');
      }

      // Create board with current user as creator
      const newBoard = await boardsService.createBoard({
        ...boardData,
        createdBy: currentUser
      });
      
      console.log('Board created successfully:', newBoard);
      
      // Add the creator as a member with admin role
      const memberData = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: 'admin'
      };
      
      // Add member using teamService
      const addedMember = await teamService.addMemberToBoard(memberData, newBoard.id);
      console.log('Added creator as member:', addedMember);
      
      // Add board to Redux store - only dispatch once
      dispatch(createBoardSuccess(newBoard));
      
      // Refresh members to ensure UI updates
      dispatch(fetchMembers());
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating board:', error);
      dispatch(createBoardFailure(error.message));
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.name || 'User'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your projects and collaborate with your team
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Board
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: 'Total Boards',
              stat: totalBoards,
              icon: ChartBarIcon,
              color: 'bg-purple-500',
              lightColor: 'bg-purple-100',
              description: 'Active boards in your workspace'
            },
            {
              name: 'Team Members',
              stat: totalMembers,
              subStat: onlineMembersCount > 0 ? `${onlineMembersCount} online` : null,
              icon: UsersIcon,
              color: 'bg-green-500',
              lightColor: 'bg-green-100',
              description: 'Members in your organization'
            },
            {
              name: 'Active Tasks',
              stat: activeTasks,
              icon: CalendarIcon,
              color: 'bg-yellow-500',
              lightColor: 'bg-yellow-100',
              description: 'Tasks in Todo or In Progress'
            },
            {
              name: 'Tasks Due Today',
              stat: tasksDueToday,
              icon: ClockIcon,
              color: 'bg-red-500',
              lightColor: 'bg-red-100',
              description: 'Tasks requiring attention today'
            }
          ].map((item) => (
            <div
              key={item.name}
              className="relative bg-white pt-5 px-4 pb-6 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center">
                <div className={`${item.lightColor} rounded-md p-3`}>
                  <item.icon
                    className={`h-6 w-6 ${item.color} bg-clip-text text-transparent`}
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {item.stat}
                    </p>
                    {item.subStat && (
                      <p className="ml-2 text-sm text-green-600">
                        {item.subStat}
                      </p>
                    )}
                  </dd>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Boards Grid */}
        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Boards</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Create New Board Card */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <div className="flex flex-col items-center">
                <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-600">
                  Create a new board
                </span>
              </div>
            </button>

            {/* Board Cards */}
            {boards.map(board => {
              // Debug log for each board's data
              console.log('Rendering board:', {
                boardId: board.id,
                boardMembers: members.filter(m => m?.boardIds?.includes(String(board.id)))
              });
              
              return (
                <BoardCard
                  key={board.id}
                  board={board}
                  tasks={tasks[board.id] || []}
                  members={members}
                />
              );
            })}
          </div>
        </div>
      </div>

      <NewBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateBoard={handleCreateBoard}
      />
    </div>
  );
};

export default Dashboard; 