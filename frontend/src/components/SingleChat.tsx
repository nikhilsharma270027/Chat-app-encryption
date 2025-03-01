import ChatContext from '@/Context/chat/ChatContext';
import MessageContext from '@/Context/message/MessageContext';
import { useDisclosure } from '@chakra-ui/react';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { toast } from "react-hot-toast";
const url = import.meta.env.VITE_SERVER_DOMAIN;
let selectedChatCompare: { _id: any; } ;
let delay = true;

export default function SingleChat ({props}: any) {
    const {
        toggleProfileView,
        details,
        socket,
        setenableChatlist,
        setenableChat,
    } = props;
    const [messages, setmessages] = useState<any>([]);
    const [newMessage, setnewMessage] = useState("");
    const context = useContext(ChatContext);
    const msgContext = useContext(MessageContext);
    const [secondUser, setsecondUser] = useState({}); // fetch the second user from chatroom data
    const [loading, setloading] = useState(false);
    const [isTyping, setisTyping] = useState(false);
    const {encryption} = msgContext;
    // const {onClose, onOpen, setOpen, open } = useDisclosure();
    const { logUser, chatroom, setchatroom, recentChats, setrecentChats } = context;

    useEffect(() => {
      const connectUser = () => {
        toggleProfileView(false);
        if (chatroom.users) {
            chatroom.users[0].user._id === logUser._id
            ? setsecondUser(chatroom.users[1].user)
            : setsecondUser(chatroom.users[0].user)
            }
        }
        connectUser();// invoking above functiom  
        // window.innerWidth > 768 
        //     ? (document.title = `ChatTap • ${secondUser?.name}`)
        //     : (document.title = `ChatTap`)

    }, [chatroom, logUser, secondUser]);

    //to fetch previous message for single chat
    useEffect(() => {
        try {
            setloading(true);
            const fetchMessage = async () => {
                if(!chatroom.users) return;
                let token =  localStorage.getItem("token");
                const response = await axios.get(
                    `${url}/api/chat/fetchMessages?Id=${chatroom._id}`, 
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                          },
                    }
                );
                let data = response.data;
                setmessages(data);
                setloading(false);
            };

            fetchMessage();
            selectedChatCompare = chatroom;

        } catch (error) {
            setloading(false);
            toast.error("Internal server error", { duration: 3000 });
        }
    }, [chatroom]);

    // To send message //
    const sendMessage = async (e: any) => {
        let condition = false;
        if(e === true){
            condition = true;
        } else {
            condition = e.key === "Enter";
        }

        if(condition && newMessage && delay) {
            try {
                delay = false;
                socket.emit("toggleTyping" , {
                    chat: chatroom,
                    status: false,
                    user: logUser,
                });


                let encryptedMessage = encryption(newMessage);
                let token = localStorage.getItem("token");
                const response = await axios.post(
                    `$[url]/api/chat/message`, 
                    {
                        content: encryptedMessage,
                        chatId: chatroom._id,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                          },
                    },
                )

                const data = response.data;
                setnewMessage("");
                setmessages([...messages, data]);
                socket.emit("new_message", data);
                socket.emit("update_chatlist", data);
                let updatedChat;
                let check = true;
                let chats = recentChats;
                chats = chats.filter((Chat: any) => {
                    if(Chat._id === chatroom._id) {
                        Chat.lastestMessage = data;
                        updatedChat = chatroom;
                        check = false;
                    }
                    return chatroom._id !== chatroom._id;
                });
                if (check) {
                    let chat = chatroom;
                    chat.latestMessage = data;
                    setrecentChats([chat, ...chats]);
                  } else {
                    setrecentChats([updatedChat, ...chats]);
                  }
                  delay = true;
            } catch (error) {
                toast.error("Internal server error", { duration: 3000 });
            }
        }
    }

    // To receive message //
    useEffect(() => {
        if (!socket) return;
      
        socket.on("message_recieved", (data: any) => {
          let message = data.message;
      
          if (
            !selectedChatCompare || 
            selectedChatCompare._id !== message.chatId._id
          ) {
            // Give notification (User receives a message from a different chat)
             // 🔴 Show notification for the new message
                toast(`📩 New message from ${message.sender.name}`, {
                    duration: 3000,
                    position: "top-right",
                });
          } else {
            setmessages([...messages, message]);
          }
          setnewMessage("");
        });
      }, [messages, recentChats]);

       //toggling typing when usertwo typing //
      useEffect(() => {
        socket.on("isTyping", (data: any) => {
          if (data.chat._id === selectedChatCompare._id) {
            if (data.status) {
              setisTyping(true);
            } else {
              setisTyping(false);
            }
          }
        });
      }, [isTyping]);
      
    //   const toggleDropdown = () => {
    //     if (dropdown) {
    //       onClose();
    //       dropdown = false;
    //     } else {
    //       onOpen();
    //       dropdown = true;
    //     }
    //   };

    
  return (
    <>
    <div
      className={`bg-[rgb(27,27,27)] h-[100vh] w-full relative overflow-hidden text-white ${
        details ? "md:w-[71.5%] xl:w-[44%]" : "md:w-[71%] xl:w-[69%] "
      } `}
    >
      <div className="flex items-center justify-between border-[1px] border-[rgb(42,42,42)]  h-16 py-3 space-x-4 px-10 bg-[rgb(36,36,36)] ">
        <div className="flex space-x-4 items-center ">
          <i
            onClick={() => {
              setenableChatlist(true);
              setenableChat(false);
              setchatroom("");
            }}
            className="fa-sharp md:hidden text-[rgb(136,136,136)] -ml-4 mr-2  fa-solid fa-arrow-left"
          ></i>

          <img
            onClick={() => {
              props.toggleProfileView(true);
            }}
            alt=""
            className="w-10 h-10 cursor-pointer rounded-full"
            // src={secondUser.peronal_info.profileim}
          ></img>
          <div className="-space-y-1">
            <p
              className=" font-semibold cursor-pointer"
              onClick={() => {
                props.toggleProfileView(true);
              }}
            >
              {/* {secondUser.personal_info.fullname} */}sharma
            </p>
            {isTyping && (
              <p className="text-sm text-[rgb(36,141,97)]">Typing ...</p>
            )}
          </div>
        </div>
        </div>
        </div>
    </>
  )
}

