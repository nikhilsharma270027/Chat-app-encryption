import { createContext } from "react";

interface ChatContextType {
  groupMessages: any[];
  setgroupMessages: React.Dispatch<React.SetStateAction<any[]>>;
  groupMembers: any[];
  setgroupMembers: React.Dispatch<React.SetStateAction<any[]>>;
  loading: boolean;
  setloading: React.Dispatch<React.SetStateAction<boolean>>;
  setrecentChats: React.Dispatch<React.SetStateAction<any[]>>;
  recentChats: any[];
  fetchRecentChats: (chatId: string) => Promise<void>;
  logUser: any;
  setlogUser: React.Dispatch<React.SetStateAction<any>>;
  accessChat: (userId: string) => Promise<any>;
  chatroom: any;
  accessGroupChat: (chatId: string) => Promise<any>;
  setchatroom: React.Dispatch<React.SetStateAction<any>>;
  createNoty: (Id: string, message: string) => Promise<any>;
  setgroupPic: React.Dispatch<React.SetStateAction<string>>;
  groupPic: string;
  setgroupName: React.Dispatch<React.SetStateAction<string>>;
  groupName: string;
  chatlistLoading: boolean;
}

// ✅ Provide default empty values
const ChatContext = createContext<ChatContextType>({
  groupMessages: [],
  setgroupMessages: () => {},
  groupMembers: [],
  setgroupMembers: () => {},
  loading: false,
  setloading: () => {},
  setrecentChats: () => {},
  recentChats: [],
  fetchRecentChats: async () => {},
  logUser: {},
  setlogUser: () => {},
  accessChat: async () => ({}),
  chatroom: {},
  accessGroupChat: async () => ({}),
  setchatroom: () => {},
  createNoty: async () => ({}),
  setgroupPic: () => {},
  groupPic: "",
  setgroupName: () => {},
  groupName: "",
  chatlistLoading: false,
});

export default ChatContext;
