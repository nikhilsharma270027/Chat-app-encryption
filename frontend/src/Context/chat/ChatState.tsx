import { useState, ReactNode } from "react";
import ChatContext from "./ChatContext";
import axios from "axios";
import { toaster } from "@/components/ui/toaster"

const url = import.meta.env.VITE_SERVER_DOMAIN;

const ChatState = ({ children }: { children: ReactNode }) => {
    const [logUser, setlogUser] = useState<any>({});
    const [chatroom, setchatroom] = useState<any>({});
    const [recentChats, setrecentChats] = useState<any[]>([]);
    const [groupPic, setgroupPic] = useState<string>("");
    const [groupName, setgroupName] = useState<string>("");
    const [groupMessages, setgroupMessages] = useState<any[]>([]);
    const [groupMembers, setgroupMembers] = useState<any[]>([]);
    const [loading, setloading] = useState<boolean>(false);
    const [chatlistLoading, setchatlistLoading] = useState<boolean>(false);

    const accessChat = async (userId: string) => {
        try {
            let token = localStorage.getItem("token");
            const response = await axios.get(
                `${url}/api/chat/accessChat?userTwo=${userId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            setchatroom(response.data); // Assuming API returns chat data
            return response.data;
        } catch (error) {
            console.error("Error accessing chat:", error);
            toaster.create({
                description: "Internal server error",
                 type: "warning",
                 duration: 3000,
            })
        }
    };

    // to fetch Group chat
    const accessGroupChat  =async (chatId: any) => {
        try {
            let token = localStorage.getItem("token");
            const response = await axios.get(
                `${url}/api/chat/accessGroupChat?chatId=${chatId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            setgroupPic(response.data.profilePic);
            setgroupName(response.data.chatname)
            setgroupMembers(response.data.users)
            setchatroom(response.data); // Assuming API returns chat data
            return response.data;
        } catch (error) {
            console.error("Error accessing chat:", error);
            toaster.create({
                description: "Internal server error",
                 type: "warning",
                 duration: 3000,
            })
        }
    }

    // to fetch Group chat
    const fetchRecentChats = async () => {
        try {
            setchatlistLoading(true);
            let token = localStorage.getItem("token");
            const response = await axios.get(
                `${url}/api/chat/fetchChats`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            setrecentChats(response.data);
            setchatlistLoading(false);
        } catch (error) {
            console.error("Error accessing chat:", error);
            toaster.create({
                description: "Internal server error",
                 type: "warning",
                 duration: 3000,
            })
        }
    } 

    const createNoty = async (Id: string, message: string) => {
        try {
          let token = localStorage.getItem("token");
      
          const response = await axios.post(
            `${url}/api/chat/message`,
            {
              noty: true,
              content: message,
              chatId: Id,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Standard format for auth tokens
              },
            }
          );
      
          return response.data; // Return the response data
        } catch (error) {
          console.error("Error creating notification:", error);
          toaster.create({
            description: "Internal server error",
             type: "warning",
             duration: 3000,
        })
        }
    };

    return (
        <ChatContext.Provider value={{ 
            groupMessages,
            setgroupMessages,
            groupMembers,
            setgroupMembers,
            loading,
            setloading,
            setrecentChats,
            recentChats,
            fetchRecentChats,
            logUser,
            setlogUser,
            accessChat,
            chatroom,
            accessGroupChat,
            setchatroom,
            createNoty,
            setgroupPic,
            groupPic,
            setgroupName,
            groupName,
            chatlistLoading,
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatState;
