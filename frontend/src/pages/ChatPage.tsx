import ChatContext from "@/Context/chat/ChatContext";
import { useContext, useState } from "react"

const ChatPage = () => {
    const [profileView, setprofileView] = useState(false);
    const [details, setdetails] = useState({});
    const context = useContext(ChatContext);
    const [toggleSeqarch, settoggleSearch] = useState(false);
    // const { chatroom, logUser, setlogUser, setchatroom} = context;
  return (
    <div>
      
    </div>
  )
}

export default ChatPage
