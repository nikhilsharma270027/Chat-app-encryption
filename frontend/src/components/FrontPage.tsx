import React, { useContext, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import { UserContext } from "../App"
import AllUser from "../components/AllUser";

interface Message {
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
}

const ChatPage: React.FC = () => {
  const { userAuth } = useContext(UserContext) as { userAuth: { username: string; profile_img: string } };
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [receiver, setReceiver] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:3000"); // Connect to WebSocket server
    socketRef.current = socket;
  
    socket.on("connect", () => console.log("Connected to server"));
  
    socket.on("private message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]); // Update messages in real-time
    });
  
    socket.on("disconnect", () => console.log("Disconnected"));
  
    return () => {
      socket.disconnect(); // Cleanup socket on unmount
    };
  }, []);
  

  useEffect(() => {
    if (userAuth?.username && socketRef.current) {
      socketRef.current.emit("join", userAuth.username);
    }
  }, [userAuth]);

  useEffect(() => {
    if (receiver) {
      axios
        .get<Message[]>("http://localhost:3000/conversation", {
          params: { sender: userAuth.username, receiver },
        })
        .then((res) => setChatHistory(res.data || [])) // Store messages in state
        .catch(() => setChatHistory([]));
    }
  }, [receiver, userAuth.username]);
  

  const sendMessage = () => {
    if (message.trim() && receiver.trim() && socketRef.current) {
      const newMessage: Message = {
        sender: userAuth.username,
        receiver,
        message,
        timestamp: new Date().toISOString(),
      };
      socketRef.current.emit("private message", newMessage);
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    }
  };

  const allMessages = [...chatHistory, ...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="flex h-screen bg-[#f5e7d3] overflow-hidden">
      <div className="h-screen w-[7%] flex flex-col justify-between">
        <div className="flex justify-center items-center flex-col">
          <img className="p-2 w-20 rounded-full" src={userAuth.profile_img} alt="Profile" />
        </div>
      </div>

      <div className="h-screen w-2/6 bg-white flex flex-col overflow-hidden">
        <div className="h-16 px-5 py-5 text-2xl font-sans bg-black text-white">Whatsapp</div>
        <div className="flex-1 w-full overflow-y-auto">
          <AllUser setReceiver={setReceiver} />
        </div>
      </div>

      <div className="h-screen flex-1 bg-gray-200 flex flex-col">
        {receiver ? (
          <>
            <div className="h-16 px-5 py-5 bg-white shadow-md flex items-center">
              <h2 className="text-xl font-bold">@{receiver}</h2>
            </div>

            <div className="flex-1 p-5 overflow-y-auto">
              {allMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 my-2 ${msg.sender === userAuth.username ? "text-right" : "text-left"}`}
                >
                  <p className="inline-block p-3 rounded-lg bg-white shadow-md">{msg.message}</p>
                </div>
              ))}
            </div>

            <div className="h-16 px-5 bg-white flex items-center shadow-md">
              <input
                className="flex-1 p-3 border rounded-md"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button className="ml-2 px-4 py-2 bg-blue-500 text-black rounded-md" onClick={sendMessage}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-500">Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
