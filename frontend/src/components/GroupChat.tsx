import ChatContext from "@/Context/chat/ChatContext";
import MessageContext from "@/Context/message/MessageContext";
import { Skeleton, useDisclosure } from "@chakra-ui/react";
import {
    PopoverBody,
    PopoverContent,
    PopoverRoot,
    PopoverTitle,
    PopoverTrigger,
  } from "@/components/ui/popover"
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { SkeletonCircle } from "./ui/skeleton";
import Loading from "./Loading";
import RenderGroupMessages from "./RenderGroupMessages";

var selectedChatCompare: { _id: any; };
let processSend = true;
let processRecieve = true;
let dropdown = false;
let members: any = [];
const url = import.meta.env.VITE_SERVER_DOMAIN;

export default function GroupChat(props: any) {
    const context = useContext(ChatContext);
    const msgContext = useContext(MessageContext);
    const [isTyping, setisTyping] = useState(false);
  const [TypingUser, setTypingUser] = useState([]);
  const { onOpen, open, setOpen, onClose, onToggle } = useDisclosure();
  const { encryption } = msgContext;
  const [newMessage, setnewMessage] = useState("");
  const [userExist, setuserExist] = useState(true);
  const {
    toggleProfileView,
    details,
    socket,
    setenableChatlist,
    setenableChat,
  } = props;
  const {
    groupMessages,
    setgroupMessages,
    groupMembers,
    setgroupMembers,
    chatroom,
    setchatroom,
    groupPic,
    setgroupPic,
    logUser,
    setgroupName,
    groupName,
    loading,
    recentChats,
    setrecentChats,
    setloading,
  } = context;

  useEffect(() => {
    if (!chatroom.users) return;
    toggleProfileView(false);
    setisTyping(false);
    selectedChatCompare = chatroom;
    members = chatroom.users;
    window.innerWidth > 768
      ? (document.title = `ChatTap • ${chatroom.chatname}`)
      : (document.title = "ChatTap");

    return () => {
      socket.emit("toggleTyping", {
        chat: chatroom,
        status: false,
        user: logUser,
      });
    };
  }, [chatroom]);

  //  fetching previos group messages //
  useEffect(() => {
    const fetchMessage = async () => {
      setloading(true);
      try {
        if (!chatroom.users || chatroom.dummy) return;
        let token = localStorage.getItem("token");
        const response = await axios.get(
          `${url}/api/chat/fetchMessages?Id=${chatroom._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        let data = await response.data;
        setgroupMessages(data);
      } catch (error) {
        toast.error("Internal server error", { duration: 3000 });
      }

      setloading(false);
    };
    fetchMessage();
  }, [chatroom]);

  // To send message //
  const sendMessage = async (e: any) => {
    let condition = false;
    if(e === true){
        condition = true;
    } else {
        condition = e.key === "Enter";
    }

    if(condition && newMessage && processSend) {
        try {
            processSend = false;
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
            setgroupMessages([...groupMessages, data]);
            socket.emit("new_message", data);
            socket.emit("update_chatlist", data);
            let updatedChat;
            let chats = recentChats;
            chats = chats.filter((Chat: any) => {
                if(Chat._id === chatroom._id) {
                    Chat.lastestMessage = data;
                    updatedChat = Chat;
                }
                return Chat._id !== chatroom._id;
            });
        
                setrecentChats([updatedChat, ...chats]);
              processSend = true;
        } catch (error) {
            toast.error("Internal server error", { duration: 3000 });
        }
        }
    }


    // removing unseen message counts when chat is open (when window size is less than 768)
  const DissmissCount = async (chatId: any) => {
    try {
      let token = localStorage.getItem("token");
      const response = await axios.get(
        `${url}/api/chat/countMssg?type=dismiss&chatId=${chatId}&userId=${logUser._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      await response.data;
    } catch (error) {
        toast.error("Internal server error", { duration: 3000 });
    }
  };

  // On  receiving  message //
  if (socket && processRecieve) {
    socket.on("message_recieved", (data: any) => {
      processRecieve = false;
      let message = data.message;
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== message.chatId._id
      ) {
      } else {
        setgroupMessages([...groupMessages, message]);
      }
      if (window.innerWidth < 768) {
        DissmissCount(message.chatId._id);
      }
      processRecieve = true;
    });
  }

  //checking is user exists in group or not
  const updateUserExist = (data: any) => {
    if (data.chat._id === selectedChatCompare._id) {
      if (data.status === "add") {
        setuserExist(true);
      } else {
        setuserExist(false);
      }
    }
  };

  const isTypingUser = (data: any) => {
    if (data.chat._id === chatroom._id) {
      if (data.status) {
        setisTyping(true);
        setTypingUser(data.user);
      } else {
        setisTyping(false);
        setTypingUser([]);
      }
    }
  };


  //socket for changing image,name,toggling typing,and
  useEffect(() => {
    if (!socket) return;

    socket.on("groupRemoved", updateUserExist);
    socket.on("toggleImage", (data : any) => {
      if (data.chat._id === selectedChatCompare._id) {
        setgroupPic(data.picture);
      }
    });
    socket.on("toggleName", (data : any) => {
      if (data.chat._id === selectedChatCompare._id) {
        setgroupName(data.name);
      }
    });
    socket.on("isTyping", isTypingUser);

    return () => {
      socket.off("isTyping");
    };
  }, [chatroom]);

  useEffect(() => {
    if (!groupMembers.length) {
      setuserExist(true);
      return;
    }

    let check = false;
    groupMembers.forEach((members) => {
      if (members.user._id === logUser._id) {
        check = true;
      }
    });
    setuserExist(check);
  }, [groupMembers]);


  // updating users while removing or adding
  const updateUsers = (data: any) => {
    if (data.group._id === selectedChatCompare._id) {
      if (data.status === "add") {
        members = members.concat(data.members);
        setgroupMembers(members);
      } else {
        members = members.filter((member: any) => {
          return member.user._id !== data.members._id;
        });
        setgroupMembers(members);
      }
    }
  };


  useEffect(() => {
    if (!socket) return;
    socket.on("updateUsers", updateUsers);
    return () => {
      socket.off("updateUsers", updateUsers);
    };

    // eslint-disable-next-line
  }, []);

  const toggleDropdown = () => {
    if (dropdown) {
    //   onClose();
      dropdown = false;
    } else {
    //   onOpen();
      dropdown = true;
    }
  };

  const closeChat = () => {
    if (window.innerWidth < 768) {
      setenableChatlist(true);
      setenableChat(false);
    }
    props.toggleProfileView(false);
    document.title = "ChatTap";
    setchatroom({});
  };


  return (
    <div
      className={`bg-[rgb(27,27,27)] h-[100vh]  relative overflow-hidden w-full  text-white ${
        details ? "md:w-[71.5%] xl:w-[44%]" : "md:w-[71%] xl:w-[69%] "
      }`}
    >
      <div className="flex justify-between  items-center h-[10vh] check border-[1px] border-[rgb(42,42,42)] py-3 space-x-4 px-10 bg-[rgb(36,36,36)] ">
        <div className="flex space-x-4 items-center ">
          <i
            onClick={() => {
              setenableChatlist(true);
              setenableChat(false);
              setchatroom("");
            }}
            className="fa-sharp md:hidden text-[rgb(136,136,136)] -ml-4 mr-2  fa-solid fa-arrow-left"
          ></i>

          {groupPic && (
            <img
              onClick={() => {
                props.toggleProfileView(true);
              }}
              alt=""
              className="w-10 h-10   cursor-pointer rounded-full"
              src={groupPic}
            ></img>
          )}
           {!groupPic && (
            <SkeletonCircle
              size="10"
              colorPalette="rgb(46,46,46)"
            />
          )}

          <div className="-space-y-1">
            {groupName && (
              <p
                className="cursor-pointer font-semibold"
                onClick={() => {
                  props.toggleProfileView(true);
                }}
              >
                {groupName}
              </p>
            )}
            {!groupName && (
              <div className="flex flex-col space-y-1">
                <Skeleton
                  colorPalette="rgb(46,46,46)"
                  width={"12rem"}
                  height="10px"
                />
                <Skeleton
                   colorPalette="rgb(46,46,46)"
                   width={"12rem"}
                   height="10px"
                />
              </div>
            )}
            {isTyping && (
              <div className="flex text-sm space-x-2">
                <p className="text-[rgb(150,150,150)] font-semibold">
                  {/* {TypingUser.name} : */}You
                </p>
                <p className="text-[rgb(36,141,97)]">Typing ...</p>
              </div>
            )}
          </div>
        </div>
        <div className="relative ">
          <PopoverBody>
            <i
              onClick={toggleDropdown}
              className="border-2  cursor-pointer border-[rgb(136,136,136)] px-1  text-sm rounded-full fa-solid text-[rgb(136,136,136)] fa-ellipsis"
            ></i>
            <PopoverContent
              className="focus:outline-none"
              bg={"rgb(49,49,49)"}
              outline="none"
              top={"2rem"}
              right={"8rem"}
              textAlign={"center"}
              borderColor={"rgb(75,75,75)"}
              width={"40"}
            >
              <p
                onClick={() => {
                  onClose();
                  props.toggleProfileView(true);
                }}
                className=" border-[rgb(75,75,75)] cursor-pointer hover:bg-[rgb(58,58,58)]  border-b-[1px] py-1 "
              >
                View details
              </p>
              <p
                onClick={closeChat}
                className="hover:bg-[rgb(58,58,58)]  cursor-pointer py-1"
              >
                Close chat
              </p>
            </PopoverContent>
          </PopoverBody>
        </div>
      </div>
      <div className={` h-[77vh]  relative`}>
        <div className={`chatBox py-2 px-4  max-h-[75vh] `}>
          {loading && <Loading></Loading>}
          {!loading && (
            <RenderGroupMessages
              details={details}
              socket={socket}
              messages={groupMessages}
              user={logUser}
            />
          )}
        </div>
      </div>
      {userExist ? (
        <div className="absolute bottom-[1px] w-full">
            <div
            className="bg-[rgb(36,36,36)] border-[1px] border-[rgb(42,42,42)] flex justify-center items-center h-[13vh]"
            onKeyDown={sendMessage}
            >
            <input
                placeholder="Your messages..."
                className="bg-[rgb(53,55,59)] border-black w-[86%] h-10 md:h-12 pr-16 outline-none rounded-xl py-1 px-4"
                type="text"
                onChange={(e) => {
                setnewMessage(e.target.value);
                socket.emit("toggleTyping", {
                    chat: chatroom,
                    status: !!e.target.value,
                    user: logUser,
                });
                }}
                value={newMessage}
                autoComplete="off"
            />
            <i
                onClick={() => sendMessage(true)}
                className={`fa-solid absolute right-12 text-xl ${
                details ? "md:right-20" : "md:right-24"
                } cursor-pointer text-[rgb(36,141,97)] fa-paper-plane`}
            />
            </div>
        </div>
      ) : (
        <div className="text-[rgb(146,145,148)] text-xs text-center  md:text-sm border-[1px] border-[rgb(42,42,42)] flex justify-center items-center bg-[rgb(36,36,36)] mt-[14px] h-[4rem]">
          You can't send message to this group because you're no longer a member
        </div>
      )}
    </div>
  );
}
