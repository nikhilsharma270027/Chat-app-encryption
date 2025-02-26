import ChatContext from '@/Context/chat/ChatContext'
import MessageContext from '@/Context/message/MessageContext';
import React, { useContext, useEffect, useState } from 'react'
import { toaster } from './ui/toaster';
import axios from 'axios';
import Profile from './Profile';
import { Skeleton } from './ui/skeleton';
const token = localStorage.getItem("token");
import {
  // Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@/components/ui/skeleton
let currentChat;
let chats;

const Chatlist = (props: any) => {
    const context = useContext(ChatContext);
    const contextMsg = useContext(MessageContext);
    const { socket, settoggleSearch } = props;
    const [groupsView, setgroupsView] =  useState(false);
    // const [recentChats, setreactChats] = useState([])
    const { decryption } = contextMsg;
    const {
        chatroom,
        accessGroupChat,
        setrecentChats,
        recentChats,
        fetchRecentChats,
        logUser,
        chatlistLoading,
        setchatroom,
      } = context;

      useEffect(() => {
        fetchRecentChats();
    }, []);

 // removing unseen message counts when chat is open/ makes msg = 0
 // put into where we open the chat of a particular
    const DissmissCount = async (chatId: any) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_SERVER_DOMAIN}/api/chat/countMssg?type=dissmiss&chatId=${chatId}&userId=${logUser._id}`,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` // Ensure "Bearer" is properly formatted
                  }
                }
              );
        } catch (error) {
            toaster.create({
                description: "Internal server error",
                type: "warning",
                duration: 2000,
              });
        }
    }

    //updating latest message in recent chat list //
    const updateLatestMessage = async (data: any) => {
      try {
        let message = data.messsage;
        let updatedUsers: any; // updatedUsers is initialized to store any updated user list.
        //checking is there chat is open and if it is equal to message chat
        if(currentChat && currentChat._id === message.chatId._id) {
          DissmissCount(message.chatId._id); // If currentChat is open and matches the chat ID of the new message
        } else {
          updatedUsers = data.users;// it assigns data.users to updatedUsers (indicating a potential change in users for that chat).
        }

         //updating latest message in chatlist//
         let updatedChat;// Stores the chat that needs to be updated.
         let check = true;// Used to determine if the chat exists in the list.
         chats = chats.filter((Chat: any) => {
          if (Chat._id === message.chatId._id) {
            Chat.latestMessage = message; // Update latest message
            if (updatedUsers) {
              Chat.users = updatedUsers; // Update users if needed
            }
            updatedChat = Chat;
            check = false; // Mark that the chat was found
          }
          return Chat._id !== message.chatId._id;
        });

        if(check) {
            let chat = message.chatId;
            chat.latestMessage = message;
            if(updatedUsers) {
              chat.users = updatedUsers
            }
          setrecentChats([chat, ...chats]);

        } else {
          setrecentChats([updatedChat, ...chats]);
        }
      } catch (error) {
        console.log("Error updaing chat", error)
      } 
    }

    useEffect(() => {
      currentChat = chatroom;
      chats = recentChats;
      if (!socket) return ;
      socket.on("latest_message", updateLatestMessage);
      console.log("")

      //updating group image of chat in recent chatlist //
      socket.on("toggleImage", (data: any) => {
        let updatedChat;
        let chats = recentChats;
        chats = chats.filter((Chat: any) => {
          if (Chat._id === data.chat._id) {
            Chat.profilePic = data.picture;
            updatedChat = Chat;
          } 
          return Chat._id !== data.chat._id;
        });
        setrecentChats([updatedChat, ...chats]);
      });

      return () => socket.off("latest_message", updateLatestMessage);
    }, [chatroom, recentChats]);

    //updating new group in chatlist .
    useEffect(() => {
      if (!socket) return;
      socket.on("created_group", (group: any) => {
        setrecentChats([group, ...recentChats]);
      });
    }, [recentChats]);


    //finding  user two and returning name of userTwo (singlechat)
    const checkUser = (user: String, chat: string) => {
      try {
        if(recentChats.length) {
          if(user._id === logUser._id) {
            if(user._id === chat.users[0]._id) {
              let otherUser = chat.users[1].personal_info.fullname;

              if(otherUser.length > 23) {
                return otherUser.slice(0, 23) + ".."
              }
              return otherUser;
            } else {
              let string = chat.users[0].personal_info.fullname
              if (string.length > 23) {
                return string.slice(0, 23) + "..";
              }
              return string;
            }
          } else {
            let string = user.name;
            if (string.length > 23) {
              return string.slice(0, 23) + "..";
            }
            return string;
          }
        }
      } catch (error) {
        console.log("checkuser chatlist", error)
      }
    }

    //finding  user two and returning userId of userTwo (singlechat)
  const checkUserId = (user: any, chat: any) => {
    try {
      if (recentChats.length) {
        if (user._id === logUser._id) {
          if (user._id === chat.users[0].user._id) {
            return chat.users[1].user._id;
          } else {
            return chat.users[0].user._id;
          }
        } else {
          return user._id;
        }
      }
    } catch (error) {
      console.log("checkuserid chatlist", error)
    }
  };

  //finding  user two and returning avtar of userTwo (singlechat)

  const checkUserAvtar = (user: any, chat: any) => {
    if (recentChats.length) {
      if (user._id === logUser._id) {
        if (user._id === chat.users[0]._id) {
          return chat.users[1].personal_info.profile_img; // Corrected path
        } else {
          return chat.users[0].personal_info.profile_img; // Corrected path
        }
      } else {
        return user.personal_info.profile_img; // Corrected path
      }
    }
  };

  // Counting unseen msgs //
  const countMsgs = (members: any) => {
    let mssgCount = 0;
    members.forEach((member: any) => {
      let memberId = member.user._id.toString();
      if(memberId === logUser._id) {
        mssgCount = member.unseenMsg;
      }
    });
    return mssgCount;
  }

  const changeListView = (value: any) => {
    setgroupsView(value)
  }
  
  return (
    <div className="bg-[rgb(36,36,36)]   text-white w-full xs:w-96 md:w-80  xl:w-[25%] h-[100%] flex flex-col space-y-2">
      <div className="flex justify-between h-[10vh] px-7 mb-2 pr-10 md:px-6  items-center  ">
        <div className="flex space-x-2 items-center">
          <p className="font-semibold hidden md:flex font-[calibri] text-3xl ">
            Messages
          </p>
          <div className="flex md:hidden">
            <Profile />
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="flex md:hidden">
            {/* <GroupCreation socket={socket} /> */}
          </div>
          <i
            onClick={() => {
              settoggleSearch(true);
            }}
            className="text-[rgb(111,111,111)]  md:text-[rgb(53,139,103)]  text-xl cursor-pointer fa-regular fa-pen-to-square"
          ></i>
        </div>
      </div>
      {/* ALL and message */}
      <div className="bg-[rgb(26,26,26)] relative justify-between py-1 px-1  mx-10 md:mx-6 rounded-lg flex">
        <p
          onClick={() => {
            changeListView(false);
          }}
          className={`${
            !groupsView ? "bg-[rgb(36,36,36)]" : ""
          }  cursor-pointer  text-center rounded-md font-semibold py-1 w-[49%] `}
        >
          All
        </p>
        <p
          onClick={() => {
            changeListView(true);
          }}
          className={`${
            groupsView ? "bg-[rgb(36,36,36)]" : ""
          } font-semibold font-[calibri] cursor-pointer text-center rounded-md py-1 w-[49%] `}
        >
          {" "}
          Groups
        </p>
      </div>
      {chatlistLoading && (
        <div className="flex h-[79vh] overflow-y-scroll chatBox  items-center flex-col space-y-2">
          <div className=" relative  w-72 2xl:w-80  flex space-x-2 items-center pt-4 ">
            <SkeletonCircle
              size="14"
              startColor="rgb(46,46,46)"
              endColor="rgb(56,56,56)"
            />
            <div className="space-y-2 ">
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                width={`${
                  window.innerWidth < 768
                    ? "14rem"
                    : window.innerWidth < 1536
                    ? "13rem"
                    : "15rem"
                }`}
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
            </div>
          </div>
          <div className=" relative  w-72 2xl:w-80  flex space-x-2 items-center pt-4 ">
            <SkeletonCircle
              size="14"
              startColor="rgb(46,46,46)"
              endColor="rgb(56,56,56)"
            />
            <div className="space-y-2 ">
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                width={`${
                  window.innerWidth < 768
                    ? "14rem"
                    : window.innerWidth < 1536
                    ? "13rem"
                    : "15rem"
                }`}
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
            </div>
          </div>
          <div className=" relative  w-72 2xl:w-80  flex space-x-2 items-center pt-4 ">
            <SkeletonCircle
              size="14"
              startColor="rgb(46,46,46)"
              endColor="rgb(56,56,56)"
            />
            <div className="space-y-2 ">
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                width={`${
                  window.innerWidth < 768
                    ? "14rem"
                    : window.innerWidth < 1536
                    ? "13rem"
                    : "15rem"
                }`}
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
            </div>
          </div>
          <div className=" relative  w-72 2xl:w-80  flex space-x-2 items-center pt-4 ">
            <SkeletonCircle
              size="14"
              startColor="rgb(46,46,46)"
              endColor="rgb(56,56,56)"
            />
            <div className="space-y-2 ">
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                width={`${
                  window.innerWidth < 768
                    ? "14rem"
                    : window.innerWidth < 1536
                    ? "13rem"
                    : "15rem"
                }`}
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
            </div>
          </div>
          <div className=" relative  w-72 2xl:w-80  flex space-x-2 items-center pt-4 ">
            <SkeletonCircle
              size="14"
              startColor="rgb(46,46,46)"
              endColor="rgb(56,56,56)"
            />
            <div className="space-y-2 ">
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                width={`${
                  window.innerWidth < 768
                    ? "14rem"
                    : window.innerWidth < 1536
                    ? "13rem"
                    : "15rem"
                }`}
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
            </div>
          </div>
          <div className=" relative  w-72 2xl:w-80  flex space-x-2 items-center pt-4 ">
            <SkeletonCircle
              size="14"
              startColor="rgb(46,46,46)"
              endColor="rgb(56,56,56)"
            />
            <div className="space-y-2 ">
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                width={`${
                  window.innerWidth < 768
                    ? "14rem"
                    : window.innerWidth < 1536
                    ? "13rem"
                    : "15rem"
                }`}
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
            </div>
          </div>
          <div className=" relative  w-72 2xl:w-80  flex space-x-2 items-center pt-4 ">
            <SkeletonCircle
              size="14"
              startColor="rgb(46,46,46)"
              endColor="rgb(56,56,56)"
            />
            <div className="space-y-2 ">
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                width={`${
                  window.innerWidth < 768
                    ? "14rem"
                    : window.innerWidth < 1536
                    ? "13rem"
                    : "15rem"
                }`}
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
            </div>
          </div>
          <div className=" relative  w-72 2xl:w-80  flex space-x-2 items-center pt-4 ">
            <SkeletonCircle
              size="14"
              startColor="rgb(46,46,46)"
              endColor="rgb(56,56,56)"
            />
            <div className="space-y-2 ">
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                width={`${
                  window.innerWidth < 768
                    ? "14rem"
                    : window.innerWidth < 1536
                    ? "13rem"
                    : "15rem"
                }`}
                height="10px"
              />
              <SkeletonText
                startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
              <SkeletonText
                // startColor="rgb(46,46,46)"
                endColor="rgb(56,56,56)"
                height="10px"
              />
            </div>
          </div>
        </div>
      )}
    </div> 
  )
}

export default Chatlist
