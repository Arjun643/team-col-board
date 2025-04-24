import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { addMessage, updateOnlineUsers } from '../store/slices/chatSlice';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ChatPanel = ({ boardId, onClose }) => {
  const dispatch = useDispatch();
  const { messages, onlineUsers } = useSelector((state) => state.chat);
  const user = useSelector((state) => state.auth.user);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      query: { boardId, userId: user.id },
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('message', (message) => {
      dispatch(addMessage({ boardId, message }));
    });

    newSocket.on('previousMessages', (messages) => {
      messages.forEach(message => {
        dispatch(addMessage({ boardId, message }));
      });
    });

    newSocket.on('onlineUsers', (users) => {
      dispatch(updateOnlineUsers({ boardId, users }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [boardId, dispatch, user.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages[boardId]]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
    };

    socket.emit('message', { boardId, message });
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentMessages = messages[boardId] || [];
  const currentOnlineUsers = onlineUsers[boardId] || [];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Team Chat
          </h3>
          <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {currentOnlineUsers.length} online
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentMessages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${
              message.userId === user.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.userId === user.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {message.userId === user.id ? 'You' : message.userName}
              </div>
              <div className="text-sm break-words">{message.content}</div>
              <div className="text-xs mt-1 opacity-75">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel; 