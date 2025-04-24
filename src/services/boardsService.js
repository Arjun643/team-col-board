import { teamService } from './teamService';

// Mock boards database with localStorage persistence
const BOARDS_STORAGE_KEY = 'team_boards';

// Initialize boards from localStorage or empty array
let boards = JSON.parse(localStorage.getItem(BOARDS_STORAGE_KEY) || '[]');

// Helper function to save boards to localStorage
const saveBoards = () => {
  localStorage.setItem(BOARDS_STORAGE_KEY, JSON.stringify(boards));
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const boardsService = {
  // Get all boards
  async getBoards() {
    await delay(500);
    // Refresh boards from localStorage
    boards = JSON.parse(localStorage.getItem(BOARDS_STORAGE_KEY) || '[]');
    return boards.map(board => ({
      ...board,
      tasksCount: board.tasks?.length || 0,
      lastActivity: board.updatedAt
    }));
  },

  // Get single board with all details
  async getBoard(boardId) {
    await delay(500);
    // Refresh boards from localStorage
    boards = JSON.parse(localStorage.getItem(BOARDS_STORAGE_KEY) || '[]');
    const board = boards.find(b => String(b.id) === String(boardId));
    if (!board) {
      console.error('Board not found:', { boardId, availableBoards: boards.map(b => b.id) });
      throw new Error('Board not found');
    }
    return {
      ...board,
      tasks: board.tasks || [],
      activities: board.activities || []
    };
  },

  // Create new board
  async createBoard(boardData) {
    await delay(500);
    const boardId = Date.now().toString();

    // Create board first
    const newBoard = {
      id: boardId,
      ...boardData,
      members: [],
      tasks: [],
      activities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add the creator to the team members for this board
    if (boardData.createdBy) {
      const creator = {
        id: boardData.createdBy.id,
        name: boardData.createdBy.name,
        email: boardData.createdBy.email,
        role: 'admin'
      };

      // Add member and wait for the result
      const member = await Promise.resolve(teamService.addMemberToBoard(creator, boardId));
      
      if (member) {
        newBoard.members = [member.id];
        console.log('Added creator as member:', { boardId, member });
      }
    }

    boards.push(newBoard);
    saveBoards();
    console.log('Created new board:', newBoard);

    return {
      ...newBoard,
      tasksCount: 0,
      lastActivity: newBoard.updatedAt
    };
  },

  // Update board
  async updateBoard(boardId, updates) {
    await delay(500);
    const index = boards.findIndex(b => String(b.id) === String(boardId));
    if (index === -1) throw new Error('Board not found');
    
    boards[index] = {
      ...boards[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    saveBoards();
    console.log('Updated board:', boards[index]);
    
    return {
      ...boards[index],
      tasksCount: boards[index].tasks?.length || 0,
      lastActivity: boards[index].updatedAt
    };
  },

  // Delete board
  async deleteBoard(boardId) {
    await delay(500);
    const index = boards.findIndex(b => String(b.id) === String(boardId));
    if (index === -1) throw new Error('Board not found');
    
    // Remove all members from the board
    const board = boards[index];
    if (board.members && board.members.length > 0) {
      await Promise.all(board.members.map(memberId => 
        teamService.removeMember(memberId, boardId)
      ));
    }
    
    boards = boards.filter(b => String(b.id) !== String(boardId));
    saveBoards();
    console.log('Deleted board:', boardId);
  }
}; 