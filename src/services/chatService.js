import { io } from 'socket.io-client';
import activityService from './activityService';

class ChatService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io('http://localhost:5000');
    
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket.IO Error:', error);
    });
  }

  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leave_room', roomId);
    }
  }

  sendMessage(message, roomId, userId, username) {
    if (this.socket) {
      const messageData = {
        message,
        roomId,
        userId,
        username,
        timestamp: new Date().toISOString(),
      };
      this.socket.emit('send_message', messageData);
      // Track the chat message in activity feed
      activityService.trackChatMessage(username, roomId);
    }
  }

  subscribeToMessages(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  unsubscribeFromMessages() {
    if (this.socket) {
      this.socket.off('receive_message');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new ChatService(); 