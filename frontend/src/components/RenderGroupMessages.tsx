import React, { useContext } from "react";
import ScrollableFeed from "react-scrollable-feed";
import ChatContext from "@/Context/chat/ChatContext";
import MessageContext from "@/Context/message/MessageContext";
import "../App.css";

function RenderGroupMessages(props: any) {
  const { messages, user, details } = props;
  const context = useContext(ChatContext);
  const contextMsg = useContext(MessageContext);
  const { logUser } = context;
  const { decryption } = contextMsg;

  //replacing loguser name with you
  const checkUser = (User: any) => {
    if (User._id === user._id) {
      return "You";
    } else {
      return User.name;
    }
  };

  //  checking is previous message sender is loguser or not //
  const checkSelf = (element: any) => {
    if (messages.length < 2) return;
    let index = messages.indexOf(element);
    if (
      messages[index - 1].noty ||
      messages[index - 1].sender._id !== element.sender._id
    ) {
      return true;
    } else {
      return false;
    }
  };

  //  decrypting encrypted message //
  const filterMessage = (encryptedMessage: any) => {
    let message = decryption(encryptedMessage);
    return message.replace(logUser.name, "you");
  };

  return (
    <ScrollableFeed
      className={`chatBox  absolute w-[96.5%] bottom-2  flex flex-col py-2  px-2 overflow-y-scroll space-y-2`}
    >
      {messages &&
        messages.map((message: any) => {
          if (message.noty) {
            return (
              <div key={message._id} className="flex  justify-center">
                <span
                  className={`bg-[rgb(36,36,36)] ${
                    details ? "lg:max-w-sm" : " lg:max-w-md"
                  } max-w-[14rem] xs:max-w-[18rem] sm:max-w-xs text-center px-4 text-[rgb(199,199,199)] py-1 rounded-lg text-sm`}
                >
                  <span className=" text-xs capitalize">
                    {checkUser(message.sender)}
                  </span>
                  &nbsp;
                  {filterMessage(message.content)}
                </span>
              </div>
            );
          } else if (message.sender._id === user._id) {
            return (
              <div
                key={message._id}
                className="flex
                        justify-end"
              >
                <span
                  className={` flex px-2  text-white py-[6px] text-sm max-w-[12rem] xs:max-w-[16rem] sm:max-w-xs  break-all   bg-[rgb(38,141,97)] rounded-lg `}
                >
                  {decryption(message.content)}
                </span>
              </div>
            );
          } else {
            return (
              <div
                className={`flex
                         `}
                key={message._id}
              >
                <div className="flex space-x-2">
                  {checkSelf(message) && (
                    <img
                      className="w-10 h-10 rounded-full "
                      alt=""
                      src={message.sender.avtar}
                    ></img>
                  )}
                  <div className="space-y-1 ">
                    {checkSelf(message) ? (
                      <div className="px-2 sm:max-w-xs  break-all  max-w-[12rem] xs:max-w-[16rem] space-y-1  text-white  py-[6px]   rounded-tr-lg  rounded-br-lg rounded-bl-lg bg-[rgb(53,55,59)] text-sm">
                        {checkSelf(message) && (
                          <p className="text-xs text-[rgb(206,206,206)] font-semibold">
                            {message.sender.name}
                          </p>
                        )}
                        <p>{decryption(message.content)}</p>
                      </div>
                    ) : (
                      <div className="px-2 bg-[rgb(53,55,59)] max-w-xs  break-all   py-[6px]  text-sm rounded-lg text-white ml-12   ">
                        {decryption(message.content)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        })}
    </ScrollableFeed>
  );
}

export default RenderGroupMessages;