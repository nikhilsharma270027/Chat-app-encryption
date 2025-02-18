import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { UserContext } from '../App';

const socket = io('http://localhost:3000');

interface Message {
  sender: string;
  receiver: string;
  message: string;
  timestamp: Date;
}

interface Usercontext {
  userAuth : any;
}

function ChatPage() {
  const { userAuth }: any = useContext(UserContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [receiver, setReceiver] = useState(''); // Username of the receiver
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  // Join the user's room when they log in
  useEffect(() => {
    if (userAuth.username) {
      socket.emit('join', userAuth.username);
    }
  }, [userAuth]);

  // Listen for private messages
  useEffect(() => {
    socket.on('private message', (msg: Message) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('private message');
    };
  }, []);

  // Fetch chat history when the receiver changes
  useEffect(() => {
    if (receiver) {
      axios
        .get('/messages', {
          params: { sender: userAuth.username, receiver },
        })
        .then((response) => {
          setChatHistory(response.data);
        })
        .catch((error) => {
          console.error('Error fetching chat history:', error);
        });
    }
  }, [receiver]);

  // Send a private message
  const sendMessage = () => {
    if (message.trim() && receiver.trim()) {
      const newMessage = {
        sender: userAuth.username,
        receiver,
        message,
        timestamp: new Date(),
      };
      socket.emit('private message', newMessage);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat Header */}
      <div className="p-4 bg-blue-600 text-white">
        <h1 className="text-xl font-bold">Chat with {receiver}</h1>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white border-b border-gray-300">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg max-w-xs ${
              msg.sender === userAuth.username
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-200 text-black mr-auto'
            }`}
          >
            <p>{msg.message}</p>
            <span className="text-xs text-gray-500">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg max-w-xs ${
              msg.sender === userAuth.username
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-200 text-black mr-auto'
            }`}
          >
            <p>{msg.message}</p>
            <span className="text-xs text-gray-500">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="flex items-center p-4 bg-gray-200 border-t border-gray-300">
        <input
          type="text"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          className="flex-1 p-2 border border-gray-400 rounded-lg mr-2 focus:outline-none"
          placeholder="Enter receiver's username..."
        />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 border border-gray-400 rounded-lg mr-2 focus:outline-none"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPage;