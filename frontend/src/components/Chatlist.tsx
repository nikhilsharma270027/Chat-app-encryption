import ChatContext from '@/Context/chat/ChatContext'
import MessageContext from '@/Context/message/MessageContext';
import { useContext, useEffect, useState } from 'react'
import { toaster } from './ui/toaster';
import axios from 'axios';
import Profile from './Profile';
import {  SkeletonCircle, SkeletonText} from './ui/skeleton';
import { Box, VStack } from "@chakra-ui/react"
// const sampleRecentChats = [
//   {
//     _id: "65f1a1c5b123456789abcdef1",
//     chatname: "Developers Hub",
//     isGroupChat: true,
//     users: [
//       { user: "65f1a1c5b123456789abc001", unseenMsg: 2 }, // Alice
//       { user: "65f1a1c5b123456789abc002", unseenMsg: 0 }, // Bob
//       { user: "65f1a1c5b123456789abc003", unseenMsg: 1 }, // Charlie
//     ],
//     admin: "65f1a1c5b123456789abc001", // Alice is admin
//     latestMessage: "65f1a1c5b123456789abc101", // ID of the last message
//     profilePic:
//       "https://api.dicebear.com/6.x/notionists-neutral/svg?seed=Felix",
//     createdAt: "2025-02-20T10:00:00Z",
//     updatedAt: "2025-02-20T10:10:00Z",
//   },
//   {
//     _id: "65f1a1c5b123456789abcdef2",
//     chatname: "Project X",
//     isGroupChat: true,
//     users: [
//       { user: "65f1a1c5b123456789abc001", unseenMsg: 3 }, // Alice
//       { user: "65f1a1c5b123456789abc004", unseenMsg: 0 }, // David
//       { user: "65f1a1c5b123456789abc005", unseenMsg: 0 }, // Eve
//     ],
//     admin: "65f1a1c5b123456789abc004", // David is admin
//     latestMessage: "65f1a1c5b123456789abc102", // ID of the last message
//     profilePic:
//       "https://cdn6.aptoide.com/imgs/1/2/2/1221bc0bdd2354b42b293317ff2adbcf_icon.png",
//     createdAt: "2025-02-19T09:00:00Z",
//     updatedAt: "2025-02-19T09:40:00Z",
//   },
// ];







const token = localStorage.getItem("token");
// import {
//   // Skeleton,
//   SkeletonCircle,
//   SkeletonText,
// } from "@/components/ui/skeleton
let currentChat: any;
let chats: any;

const Chatlist = (props: any) => {
    const context = useContext(ChatContext);
    const contextMsg = useContext(MessageContext);
    const { socket, settoggleSearch, setenableChat, setenableChatlist } = props;
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
    const checkUser = (user: any, chat: any) => {
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

 // Function to count unseen messages for the logged-in user
const countMsgs = (members: any) => {
  let mssgCount = 0;
  
  members.forEach((member: any) => {
    // Check if member.user exists before accessing its properties
    if (member?.user?._id) {
      let memberId = member.user._id.toString();
      
      // Compare the member's ID with the logged-in user's ID
      if (memberId === logUser._id) {
        mssgCount = member.unseenMsg ?? 0; // Default to 0 if unseenMsg is undefined
      }
    } else {
      console.warn("Invalid member object:", member); // Log invalid entries
    }
  });

  return mssgCount;
};


 //  fetching group chat //
 const setGroupChat = (element: any) => {
  if (chatroom._id !== element._id) {
    if (window.innerWidth < 768) {
      setenableChatlist(false);
      setenableChat(true);
    }

    accessGroupChat(element._id);
    element.dummy = true;
    setrecentChats(
      recentChats.map((chat) => {
        if (chat._id === element._id) {
          chat.users = chat.users.map((members: any) => {
            if (members.user._id === logUser._id) {
              members.unseenMsg = 0;
              return members;
            } else {
              return members;
            }
          });

          return chat;
        } else {
          return chat;
        }
      })
    );
  }
};

//fetching single chat //
const setSingleChat = (element: any) => {
  if (element._id !== chatroom._id) {
    if (window.innerWidth < 768) {
      setenableChatlist(false);
      setenableChat(true);
    }

    setchatroom(element);
    DissmissCount(element._id);
    setrecentChats(
      recentChats.map((chat) => {
        if (chat._id === element._id) {
          chat.users = chat.users.map((members: any) => {
            if (members.user._id === logUser._id) {
              members.unseenMsg = 0;
              return members;
            } else {
              return members;
            }
          });

          return chat;
        } else {
          return chat;
        }
      })
    );
  }
};


  const changeListView = (value: any) => {
    setgroupsView(value)
  }

  // decrypting latestMessage of chats in recentchatlist //
  const filterMessage = (encryptedMessage: any, isGroup: any, user: any) => {
    let message = "new"; //decryption(encryptedMessage); // decrypting the message
    let compressedMessage; // will store the formmated message
    if (isGroup) {
      let name = user._id === logUser.user._id ? "you" : user.name;
      // Replace the logged-in user's name with "you" for better readability
      compressedMessage = message.replace(logUser.name, "you");

      // Format the message as: "SenderName : message"
      let finalmessage = name + " : " + compressedMessage;

      // Shorten the message if it's longer than 26 characters
      return finalmessage.length > 26
        ? finalmessage.slice(0, 27) + ".."
        : finalmessage;
      } else {
      // If it's a personal chat, just shorten the message if necessary
      compressedMessage =
        message.length > 26 ? message.slice(0, 27) + ".." : message;
      }

      // Return the formatted message
      console.log(message)
      console.log(compressedMessage)
      return compressedMessage;
      };
  
  return (
    <div className="bg-[rgb(36,36,36)]   text-white w-full xs:w-96 md:w-80  xl:w-[25%] h-[100%] flex flex-col space-y-2 rounded-2xl">
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
        <div className='h-[79vh] pt-4 overflow-y-scroll chatBox items-center flex-col space-y-2'>
          {
            recentChats.length > 0 && 
                recentChats.map((element: any, index: any) =>{
                  if(element.isGroupChat) {
                    return (
                        <div key={element._id || `group-chat-${index}`} onClick={(e) => console.log(e)}
                          className={`flex hover:bg-[rgb(44,44,44)] cursor-pointer 
                              ${
                                element._id === chatroom._id
                               ? "bg-[rgb(27,27,27)] border-l-2  border-[rgb(36,141,97)]"
                               : "bg-[rgb(36,36,36)] "
                              }
                            px-4 justify-center  w-full text-white `}
                        >

                          <div key={element._id}
                            className="flex space-x-2 items-center  md:px-0 py-2 w-72 2xl:w-80  relative border-b-[1px] border-[rgb(42,42,42)]"
                          >
                              <img
                                alt=""
                                className="w-12 h-12 2xl:w-[3.2rem] 2xl:h-[3.2rem] rounded-[50%]"
                                src={element.profilePic}
                              ></img>
                              <div>
                                <div className='flex justify-between'>
                                  <p className='text-base font-semibold'>
                                    {element.chatname.length > 25
                                      ? element.chatname.slice(0, 25) + "..."
                                      : element.chatname 
                                    }
                                  </p>
                                </div>

                                <div className="flex justify-between">
                                  <p
                                    className={`${
                                      countMsgs(element.users) > 0
                                        ? "text-[rgb(223,223,223)]"
                                        : "text-[rgb(146,145,148)]"
                                    } text-sm`}
                                  >
                                    {/* {filterMessage(
                                      element.latestMessage.content,
                                      true,
                                      element.latestMessage.sender
                                    )} */}
                                  </p>
                                </div>
                              </div>
                              {countMsgs(element.users) > 0 && (
                                  <p
                                    className="bg-[rgb(197,73,69)] absolute right-2 top-6 rounded-full font-bold flex justify-center 
                              items-center text-[0.7rem] h-5 w-5"
                                  >
                                    {countMsgs(element.users) > 99
                                      ? "99+"
                                      : countMsgs(element.users)}
                                  </p>
                                )}
                          </div>
                        </div>
                    );
                  } else if(!groupsView) {
                    if (element.latestMessage) {
                      return (
                        <div
                          onClick={() => {
                            setSingleChat(element);
                          }}
                          className={`flex ${
                            element._id === chatroom._id
                              ? "bg-[rgb(27,27,27)] border-l-2  border-[rgb(36,141,97)]"
                              : "bg-[rgb(36,36,36)] "
                          } 
                              cursor-pointer w-full justify-center hover:bg-[rgb(44,44,44)]   px-4   text-white `}
                              key={element._id || `chat-${index}`}
                        >
                          <div className="flex space-x-2 py-2 items-center  w-72 2xl:w-80   relative  border-b-[1px] border-[rgb(42,42,42)]">
                            <img
                              alt=""
                              className="w-12 h-12 2xl:w-[3.2rem] 2xl:h-[3.2rem] rounded-[50%]"
                              src={checkUserAvtar(
                                element.latestMessage.sender,
                                element
                              )}
                            ></img>
                            <div>
                              <div className="flex font-semibold  justify-between">
                                <p className="text-base">
                                  {checkUser(element.latestMessage.sender, element)}
                                </p>
                              </div>
                              <div className="flex justify-between">
                                <p
                                  className={`${
                                    countMsgs(element.users) > 0
                                      ? "text-white"
                                      : "text-[rgb(146,145,148)]"
                                  } text-sm`}
                                >
                                  {/* {filterMessage(element.latestMessage.content)} */}
                                </p>
                              </div>
                            </div>
                            {countMsgs(element.users) > 0 && (
                              <p
                                className="bg-[rgb(197,73,69)] absolute right-2 top-6 rounded-full font-bold flex justify-center 
                           items-center text-[0.7rem] h-5 w-5"
                              >
                                {countMsgs(element.users) > 99
                                  ? "99+"
                                  : countMsgs(element.users)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      return null;
                    }
                  } else {
                    return null;
                  }
                })}
              {recentChats.length === 0 && (
                <div className="h-96 text-[rgb(111,111,111)] flex items-center text-lg">
                  No recent chats
                </div>
              )}
            </div>
          )}

      

    {/* 
      {chatlistLoading && (
          <VStack spacing={4} className="h-[79vh] overflow-y-scroll chatBox items-center">
            {[...Array(8)].map((_, index) => (
              <Box key={index} className="relative w-72 2xl:w-80 flex space-x-2 items-center pt-4">
                <SkeletonCircle size="14" />
                <VStack spacing={2} align="start">
                  <SkeletonText noOfLines={1} skeletonHeight="10px" w={{
                    base: "14rem",
                    md: "13rem",
                    xl: "15rem",
                  }} />
                  <SkeletonText noOfLines={2} skeletonHeight="10px" w="full" />
                </VStack>
              </Box>
            ))}
          </VStack>
        )} */}
    </div> 
  )
}

export default Chatlist
