import React, { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import ChatContext from "@/Context/chat/ChatContext";
import MessageContext from "@/Context/message/MessageContext";
import {
  DrawerBody,
  DrawerHeader,
  DrawerContent,
  useToast,
  useDisclosure,
  FormControl
  Spinner
  DrawerRoot,
} from "@chakra-ui/react";

const url = process.env.REACT_APP_URL;

function GroupCreation({ socket }: any) {
  const { isOpen, onOpen, onClose } = useDisclosure();
//   const btnRef = useRef();
  const { encryption } = useContext(MessageContext);
  const {
    setchatroom,
    setrecentChats,
    recentChats,
    createNoty,
    setgroupPic,
    setgroupName,
    setgroupMembers,
  } = useContext(ChatContext);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(true);
  const [groupPicture, setGroupPicture] = useState(
    "https://cdn6.aptoide.com/imgs/1/2/2/1221bc0bdd2354b42b293317ff2adbcf_icon.png"
  );
  const [chatName, setChatName] = useState("");
  const [phase, setPhase] = useState(1);
  const [isPicture, setIsPicture] = useState(false);
  const toast = useToast();
  const [selectedUsers, setSelectedUsers] = useState<any>([]);
  const [selectedUsersId, setSelectedUsersId] = useState<any>([]);

  useEffect(() => {
    setrecentChats(recentChats);
  }, []);

  const axiosInstance = axios.create({
    baseURL: url,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const onChange = async (e: any) => {
    try {
      setLoading(true);
      setSearch(e.target.value);

      const { data } = await axiosInstance.get(`/api/chat/searchUser`, {
        params: { search: e.target.value },
      });

      setLoading(false);
      setUsers(data.length ? data : []);
      setResult(!!data.length);
    } catch (error) {
      setLoading(false);
      toast({
        description: "Internal server error",
        status: "warning",
        isClosable: true,
        duration: 3000,
      });
    }
  };

  const collectUser = (selectedUser: any) => {
    if (selectedUsers.some((user:any) => user._id === selectedUser._id)) return;
    setSelectedUsers([...selectedUsers, selectedUser]);
    setSelectedUsersId([...selectedUsersId, { user: selectedUser._id }]);
    setSearch("");
    setUsers([]);
  };

  const removeUser = (user: any) => {
    setSelectedUsers(selectedUsers.filter((u: any) => u._id !== user._id));
    setSelectedUsersId(selectedUsersId.filter((u: any) => u.user !== user._id));
  };

  const UploadPic = async (e: any) => {
    setLoading(true);
    try {
      const file = e.target.files[0];
      if (!file || (file.type !== "image/jpeg" && file.type !== "image/png")) {
        throw new Error("Invalid file format");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "chat_app");
      formData.append("cloud_name", "dynjwlpl3");

      const { data } = await axios.post(
        "https://api.cloudinary.com/v1_1/dynjwlpl3/image/upload",
        formData
      );

      setGroupPicture(data.url);
      setIsPicture(true);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast({
        description: error.message || "Internal server error",
        status: "warning",
        isClosable: true,
        duration: 3000,
      });
    }
  };

  const createGroup = async () => {
    if (!chatName) {
      toast({
        description: "Please enter group name",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const { data } = await axiosInstance.post(`/api/chat/createGroup`, {
        chatName,
        selectedUsersId,
        groupPicture,
      });

      const message = `Created group ${data.chatname}`;
      const encryptedMessage = encryption(message);
      const latestMessage = await createNoty(data._id, encryptedMessage);

      data.latestMessage = latestMessage;
      setchatroom(data);
      setgroupMembers(data.users);
      setgroupPic(data.profilePic);
      setgroupName(data.chatname);
      socket.emit("group_created", data);
      socket.emit("update_Chatlist", latestMessage);
      setrecentChats([data, ...recentChats]);

      resetState();
      onClose();

      toast({
        description: `Created group ${chatName}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        description: "Internal server error",
        status: "warning",
        isClosable: true,
        duration: 3000,
      });
    }
  };

  const changePhase = () => {
    if (selectedUsers.length < 2) {
      toast({
        description: "Add at least two members",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (phase === 1) {
      setPhase(2);
      setLoading(false);
      setResult(true);
      setSearch("");
    } else {
      createGroup();
    }
  };

  const resetState = () => {
    setSelectedUsers([]);
    setSelectedUsersId([]);
    setSearch("");
    setChatName("");
    setGroupPicture(
      "https://cdn6.aptoide.com/imgs/1/2/2/1221bc0bdd2354b42b293317ff2adbcf_icon.png"
    );
  };

  return (
    <div>
      <img
        title="Create group"
        onClick={onOpen}
        className="w-8 cursor-pointer"
        src="https://res.cloudinary.com/dynjwlpl3/image/upload/v1675316635/Chat-app/createGroup_togebl.png"
      />
      <DrawerRoot isOpen={isOpen} placement="end" onClose={resetState}>
        <DrawerOverlay />
        <DrawerContent bg="rgb(27,27,27)" color="white">
          <DrawerHeader bg="rgb(36,36,36)">
            <div className="flex space-x-4 text-lg items-center font-semibold pt-2">
              <i onClick={resetState} className="fa-solid cursor-pointer fa-arrow-left"></i>
              <p>{phase === 1 ? "Add group members" : "New group"}</p>
            </div>
          </DrawerHeader>
          <DrawerBody>
            <div className={`mt-4`}>
              <input
                onChange={onChange}
                value={search}
                className="border px-4 outline-none w-full py-2 rounded-lg bg-transparent text-white"
                placeholder="Enter names or email address"
              />
            </div>
            {loading && <Spinner />}
            {!loading && result && (
              <div className="mt-6">
                {users.map((user: any) => (
                  <div key={user._id} onClick={() => collectUser(user)} className="flex p-2 cursor-pointer">
                    <img className="w-12 rounded-full" src={user.avatar} />
                    <p>{user.name}</p>
                  </div>
                ))}
              </div>
            )}
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </div>
  );
}

export default GroupCreation;
