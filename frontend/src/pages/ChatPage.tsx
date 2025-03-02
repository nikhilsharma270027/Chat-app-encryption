
import Chat from "@/components/Chat";
import Chatlist from "@/components/Chatlist";
import Navbar from "@/components/Navbar";
import Profile from "@/components/Profile";
import ChatContext from "@/Context/chat/ChatContext";
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
const ENDPOINT = "http://localhost:3000";
var socket: any;

export const ChatPage = () => {
  const navigate = useNavigate();
    const [profileView, setprofileView] = useState(false);
    const [details, setdetails] = useState({});
    const context = useContext(ChatContext);
    const [toggleSearch, settoggleSearch] = useState(false);
    const { chatroom, logUser, setlogUser, setchatroom} = context;
    const [loading, setloading] = useState(true);
    const [manageScreen, setmanageScreen] = useState(false);
    const [enableChatlist, setenableChatlist] = useState(true);
    const [enableChat, setenableChat] = useState(true);


    
    useEffect(() => {
      // user does have token redirect to home page
      const redirectpPage = () => {
          // if(!localStorage.getItem("token")){
          //   navigate("/");
          //   return;
          // } else {
            const userData = localStorage.getItem("user");
            const userInfo = userData ? JSON.parse(userData) : null;
            if (!userData) {
              console.log("No user found in localStorage.");
              navigate("/signup"); // Redirect if no user is found
              return;
            }
            setlogUser(userInfo);
            console.log(userInfo.username)
            socket = io(ENDPOINT, {
              transports: ["websocket"], // Ensure WebSocket is used
            });
            socket.emit("setup", userInfo.username)
            navigate("/chat")
          // }
      }
      redirectpPage();
    }, [])

    const toggleLoading = () => {
      setloading(false)
    }

      //toggling chat details section//
  const toggleProfileView = (value: any) => {
    setprofileView(value);
    if (!value) {
      setdetails({});
      return;
    }

    if (chatroom.isGroupChat) {
      setdetails(chatroom);
    } else {
      if (logUser._id === chatroom.users[0].user._id) {
        setdetails(chatroom.users[1].user);
      } else {
        setdetails(chatroom.users[0].user);
      }
    }
  };

  return (
    <div>
      <div
      onLoad={toggleLoading}
      className="bg-[#B3D8A8] justify-center flex h-[100vh] text-red">
        {loading && (
            <div className="absolute flex flex-col z-50 pt-44 bg-[#B3D8A8] w-full h-[100vh] items-center ">
              <img
                className="w-52"
                alt=""
                src={
                  "https://res.cloudinary.com/dynjwlpl3/image/upload/v1674985284/Chat-app/logo_rmgpil.png"
                }
              ></img>
              <div className="text-4xl  text-[rgb(194,194,194)] flex font-semibold">
                <p className="text-[rgb(79,224,165)]">Ch</p>
                <p className="text-[rgb(126,87,194)]">at</p>
                <p className="text-[rgb(254,194,0)]">Tap</p>
              </div>
              <div className="text-[rgb(170,170,170)] pt-36 items-center  flex space-x-2">
                <i className="fa-solid fa-lock"></i>
                <p>End to end encrypted</p>
              </div>
            </div>
          )}
          <Navbar
            socket={socket}
            settoggleSearch={settoggleSearch}
          /> 
          <Chatlist 
            socket={socket}
            settoggleSearch={settoggleSearch}
          />  
          {enableChat && (
            <Chat 
              socket={socket}
              details={profileView}
              toggleProfileView={toggleProfileView}
              enableChat={enableChat}
              setenableChatlist={setenableChatlist}
            />
          )} 
           {/* {profileView && !manageScreen && (
            <Profile
              // toggleProfileView={toggleProfileView}
              // socket={socket}
              // Profile={details}
            />
          )} */}
      </div>
    </div>
  )
}

export default ChatPage
