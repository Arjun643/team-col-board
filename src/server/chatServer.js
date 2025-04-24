const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store connected users by board
const boardUsers = new Map();
// Store messages by board (limit to last 100 messages)
const boardMessages = new Map();
const MESSAGE_HISTORY_LIMIT = 100;

io.on('connection', (socket) => {
  const { boardId, userId, userName } = socket.handshake.query;
  console.log(`User ${userName} (${userId}) connected to board ${boardId}`);

  // Join board room
  socket.join(boardId);

  // Add user to board's online users
  if (!boardUsers.has(boardId)) {
    boardUsers.set(boardId, new Map());
  }
  boardUsers.get(boardId).set(socket.id, { userId, userName });

  // Send current online users
  const onlineUsers = Array.from(boardUsers.get(boardId).values());
  io.to(boardId).emit('onlineUsers', onlineUsers);

  // Load previous messages
  if (boardMessages.has(boardId)) {
    socket.emit('previousMessages', boardMessages.get(boardId));
  }

  // Handle new messages
  socket.on('message', ({ boardId, message }) => {
    try {
      if (!boardMessages.has(boardId)) {
        boardMessages.set(boardId, []);
      }

      const messages = boardMessages.get(boardId);
      messages.push(message);

      // Keep only the last MESSAGE_HISTORY_LIMIT messages
      if (messages.length > MESSAGE_HISTORY_LIMIT) {
        messages.splice(0, messages.length - MESSAGE_HISTORY_LIMIT);
      }
      
      // Broadcast message to all users in the board
      io.to(boardId).emit('message', message);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', 'Failed to process message');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${userName} disconnected from board ${boardId}`);
    if (boardUsers.has(boardId)) {
      boardUsers.get(boardId).delete(socket.id);
      const onlineUsers = Array.from(boardUsers.get(boardId).values());
      io.to(boardId).emit('onlineUsers', onlineUsers);
    }
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    socket.emit('error', 'An error occurred');
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
}); 