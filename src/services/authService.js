// Mock user database
const users = [];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  // Register new user
  async register(userData) {
    await delay(1000); // Simulate API delay
    
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      password: undefined // Don't store password in our mock DB
    };

    users.push(newUser);
    return { ...newUser };
  },

  // Login user
  async login(credentials) {
    await delay(1000); // Simulate API delay
    
    const user = users.find(
      user => user.email === credentials.email
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    return { ...user };
  },

  // Get current user
  async getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user;
  },

  // Logout
  async logout() {
    localStorage.removeItem('user');
  }
}; 