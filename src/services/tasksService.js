// Mock tasks database
const STORAGE_KEY = 'team_tasks';

const getTasks = () => {
  const tasksData = localStorage.getItem(STORAGE_KEY);
  return tasksData ? JSON.parse(tasksData) : {};
};

const saveTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const tasksService = {
  // Get all tasks for a board
  async getTasks(boardId) {
    await delay(500);
    const tasks = getTasks();
    return tasks[boardId] || [];
  },

  // Create new task
  async createTask(boardId, taskData) {
    if (!boardId) throw new Error('Board ID is required');
    
    await delay(500);
    const tasks = getTasks();
    const newTask = {
      id: Date.now().toString(),
      boardId,
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!tasks[boardId]) {
      tasks[boardId] = [];
    }
    tasks[boardId].push(newTask);
    saveTasks(tasks);
    return newTask;
  },

  // Update task
  async updateTask(boardId, taskId, updates) {
    if (!boardId || !taskId) throw new Error('Board ID and Task ID are required');
    
    await delay(500);
    const tasks = getTasks();
    const taskIndex = tasks[boardId]?.findIndex(t => String(t.id) === String(taskId));
    if (taskIndex === -1) throw new Error('Task not found');

    tasks[boardId][taskIndex] = {
      ...tasks[boardId][taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    saveTasks(tasks);
    return tasks[boardId][taskIndex];
  },

  // Delete task
  async deleteTask(boardId, taskId) {
    if (!boardId || !taskId) throw new Error('Board ID and Task ID are required');
    
    await delay(500);
    const tasks = getTasks();
    if (!tasks[boardId]) throw new Error('Board not found');
    
    tasks[boardId] = tasks[boardId].filter(t => String(t.id) !== String(taskId));
    saveTasks(tasks);
  },

  // Move task between columns
  async moveTask(boardId, taskId, toColumn) {
    if (!boardId || !taskId) throw new Error('Board ID and Task ID are required');
    if (!toColumn) throw new Error('Target column is required');
    
    await delay(500);
    const tasks = getTasks();
    const taskIndex = tasks[boardId]?.findIndex(t => String(t.id) === String(taskId));
    if (taskIndex === -1) throw new Error('Task not found');

    tasks[boardId][taskIndex] = {
      ...tasks[boardId][taskIndex],
      status: toColumn,
      updatedAt: new Date().toISOString()
    };

    saveTasks(tasks);
    return tasks[boardId][taskIndex];
  }
};

export { tasksService }; 