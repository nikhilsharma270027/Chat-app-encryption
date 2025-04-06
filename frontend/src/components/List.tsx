import React, { useContext, useState } from "react";
import ChatContext from "@/Context/chat/ChatContext";
import MessageContext from "@/Context/message/MessageContext";
import { DialogContent, DialogTrigger } from "@/components/ui/dialog";
  import { PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import toast from "react-hot-toast";

const url = import.meta.env.VITE_SERVER_DOMAIN || "http://localhost:5000";

interface Props {
  Profile: any;
  groupMembers: any[];
  setgroupMembers: (val: any[]) => void;
  socket: any;
}

export default function List({ Profile, groupMembers, setgroupMembers, socket }: Props) {
  const [open, setOpen] = useState(false);
  const context = useContext(ChatContext);
  const contextMsg = useContext(MessageContext);
  const { encryption } = contextMsg;
  const {
    logUser,
    createNoty,
    groupMessages,
    setgroupMessages,
    recentChats,
    setrecentChats,
    accessChat,
  } = context;

  const removeFromGroup = async (User: any) => {
    setOpen(false);
    try {
      let token = localStorage.getItem("token");
      const response = await fetch(`${url}/api/chat/removeUser?chatId=${Profile._id}&userId=${User._id}`, {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token || "",
        },
      });

      let data = await response.json();
      if (data.success) {
        setgroupMembers(groupMembers.filter((member) => member.user._id !== User._id));

        let message = "removed " + User.name;
        let encryptedMessage = encryption(message);
        let noty = await createNoty(Profile._id, encryptedMessage);
        noty.removedUserId = User._id;
        socket.emit("new_message", noty);
        socket.emit("update_Chatlist", noty);

        let status = {
          users: [{ user: User._id }],
          chat: Profile,
          status: "remove",
        };
        socket.emit("member_status", status);

        let dataSend = { group: Profile, members: User, status: "remove" };
        socket.emit("change_users", dataSend);

        let updatedChat;
        let chats = recentChats.filter((Chat) => {
          if (Chat._id === noty.chatId._id) {
            Chat.latestMessage = noty;
            updatedChat = Chat;
          }
          return Chat._id !== noty.chatId._id;
        });

        setrecentChats([updatedChat, ...chats]);
        setgroupMessages([...groupMessages, noty]);
      }
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  const setSingleChat = async (User: any) => {
    let element = await accessChat(User._id);
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
  };

  return (
    <div>
      <DialogContent >
        <DialogTrigger asChild>
          <p className="text-emerald-700 cursor-pointer font-semibold text-sm underline">Show all</p>
        </DialogTrigger>
        <DialogContent className="bg-[#242424] p-0 max-h-[30rem] overflow-y-auto rounded-md w-[90vw] max-w-[27rem]">
          <div className="flex justify-between px-6 py-3 bg-[#242424]">
            <div className="flex space-x-2">
              <img className="w-6 h-6" alt="group-icon" src="https://res.cloudinary.com/dynjwlpl3/image/upload/v1675095423/Chat-app/group_iu5tv2.png" />
              <p className="text-[#a7a9ab] text-base font-semibold">MEMBER ({groupMembers.length})</p>
            </div>
            <i className="fa-solid fa-xmark text-[#a7a9ab] text-xl cursor-pointer" onClick={() => setOpen(false)}></i>
          </div>

          <div className="bg-[#1b1b1b] text-white">
            <div onClick={() => logUser._id !== Profile.admin._id && setSingleChat(Profile.admin)} className="flex items-center px-8 py-2 hover:bg-[#2c2c2c] cursor-pointer">
              <img alt="" className="w-12 h-12 rounded-full" src={Profile.admin.avtar} />
              <div className="ml-2 relative">
                <p className="font-semibold">{logUser._id === Profile.admin._id ? "You" : Profile.admin.name}</p>
                <p className="text-xs absolute right-4 top-1 font-bold px-2 py-1 rounded-md bg-[#35373b] text-white">Group Admin</p>
              </div>
            </div>

            {groupMembers.map((members) =>
              !members.isRemoved && members.user._id !== Profile.admin._id ? (
                <div key={members.user._id} className="flex items-center px-8 py-2 hover:bg-[#2c2c2c] cursor-pointer relative group">
                  <img alt="" className="w-12 h-12 rounded-full" src={members.user.avtar} onClick={() => setSingleChat(members.user)} />
                  <p onClick={() => setSingleChat(members.user)} className="ml-2 font-semibold text-sm">
                    {logUser._id === members.user._id ? "You" : members.user.name}
                  </p>
                  {logUser._id === Profile.admin._id && (
                    <div className="absolute right-14 hidden group-hover:flex">
                      <PopoverContent>
                        <PopoverTrigger asChild>
                          <i className="fa-solid fa-ellipsis text-white"></i>
                        </PopoverTrigger>
                        <PopoverContent className="bg-[#313131] border border-[#4b4b4b] w-32 text-center text-white p-2">
                          <p
                            className="border-b border-[#4b4b4b] py-1 hover:bg-[#3a3a3a]"
                            onClick={() => removeFromGroup(members.user)}
                          >
                            Remove
                          </p>
                          <p className="py-1 hover:bg-[#3a3a3a]" onClick={() => setSingleChat(members.user)}>
                            View profile
                          </p>
                        </PopoverContent>
                      </PopoverContent>
                    </div>
                  )}
                </div>
              ) : null
            )}
          </div>
        </DialogContent>
      </DialogContent>
    </div>
  );
}
