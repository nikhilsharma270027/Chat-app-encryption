import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatContext from "@/Context/chat/ChatContext";
import {
  DrawerHeader,
  DrawerBackdrop,
  DrawerContent,
  useDisclosure,
  Spinner,
  DrawerRoot,
} from "@chakra-ui/react";
import toast from "react-hot-toast";

const url = import.meta.env.REACT_APP_URL;

function Profile() {
  const navigate = useNavigate();
  const { onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLImageElement | null>(null);
  const context = useContext(ChatContext);
  const { setchatroom, logUser, setlogUser } = context;
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [currentName, setCurrentName] = useState(logUser.name);

  useEffect(() => {
    setCurrentName(logUser.name);
  }, [logUser]);

  const logout = () => {
    document.title = "ChatTap";
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setchatroom({});
    navigate("/");
  };

  const editName = () => setEnabled(true);

  const changeName = async () => {
    if (username === currentName) {
      return toast.error("New name must be different");

    }
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${url}/api/chat/changeName`,
        { type: "user", Id: logUser._id, name: username },
        { headers: { "auth-token": token } }
      );

      setlogUser({ ...logUser, name: data.name });
      localStorage.setItem("user", JSON.stringify(data));
      setCurrentName(data.name);
      setUsername("");
      setEnabled(false);
      toast.success("Name updated successfully");
    } catch (error) {
      toast.error("Server error");
    }
  };

  const changePic = async (e: any) => {
    setLoading(true);
    try {
      const file = e.target.files[0];
      if (!file || !["image/jpeg", "image/png"].includes(file.type)) {
        throw new Error("Invalid file format");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "chat_app");
      formData.append("cloud_name", "dynjwlpl3");

      const { data: pic } = await axios.post("https://api.cloudinary.com/v1_1/dynjwlpl3/image/upload", formData);
      const picture = pic.url;

      const token = localStorage.getItem("token");
      const { data: response } = await axios.get(`${url}/api/chat/changePic`, {
        params: { isGroupChat: false, Id: logUser._id, pic: picture },
        headers: { "auth-token": token },
      });

      if (response.success) {
        setlogUser({ ...logUser, avatar: picture });
        localStorage.setItem("user", JSON.stringify({ ...logUser, avatar: picture }));
        toast.error("Profile picture updated");
      }
    } catch (error: any) {
      toast.error(error.message || "Server error");
    }
    setLoading(false);
  };

  return (
    <div>
      <img ref={btnRef} title="Profile" alt="" onClick={onOpen} src={logUser.avatar} className="rounded-full cursor-pointer h-9 w-9" />
      <DrawerRoot open={open} placement="end" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerBackdrop />
        <DrawerContent colorPalette="white" bg="rgb(36,36,36)">
          <DrawerHeader className="flex justify-between px-6">Profile</DrawerHeader>
          <div className="flex flex-col items-center py-8">
            <div className="relative group">
              <img className="rounded-full w-40 h-40" src={logUser.avatar} alt="Profile" />
              {loading && <Spinner size="xl" color="white" className="absolute" />}
              {!logUser.isGuest && (
                <input type="file" className="absolute opacity-0 w-full h-full" onChange={changePic} />
              )}
            </div>
          </div>
          <div className="px-4">
            <p className="text-green-500 font-semibold">Your Name</p>
            <div className="flex items-center border-b border-gray-700">
              <input
                className="bg-transparent text-white w-full outline-none"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!enabled}
              />
              {!enabled && !logUser.isGuest && <i onClick={editName} className="cursor-pointer text-gray-400 fa fa-pen" />}
              {enabled && username && <i onClick={changeName} className="cursor-pointer text-gray-400 fa fa-check" />}
            </div>
          </div>
          <div className="px-4 mt-4">
            <p className="text-green-500 font-semibold">Your Email</p>
            <p className="border-b border-gray-700 pb-2">{logUser.email}</p>
          </div>
          <div className="flex justify-center items-center h-16 cursor-pointer" onClick={logout}>
            <img className="w-5 h-5" src="https://res.cloudinary.com/dynjwlpl3/image/upload/v1675316912/Chat-app/power-off_qp0sqc.png" alt="Logout" />
            <p className="text-lg font-semibold ml-2">Logout</p>
          </div>
        </DrawerContent>
      </DrawerRoot>
    </div>
  );
}

export default Profile;
