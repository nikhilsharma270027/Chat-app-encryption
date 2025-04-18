import React, { useContext } from "react";
import ScrollableFeed from "react-scrollable-feed";
import MessageContext from "@/Context/message/MessageContext";
import "../App.css";

const ScrollableChat = (props: any) => {
  const { messages, user } = props;
  const contextMsg = useContext(MessageContext);
  const { decryption } = contextMsg;

  return (
    <ScrollableFeed className=" chatBox flex  flex-col py-2  absolute w-[96.5%] bottom-2 px-8  overflow-y-scroll space-y-2  ">
      {messages &&
        messages.map((message: any) => {
          return (
            <div
              className={`flex
                      ${
                        message.sender._id === user._id ? "justify-end" : ""
                      }   `}
              key={message._id}
            >
              <span
                className={`px-2 py-[6px] space-x-2 flex max-w-[12rem] xs:max-w-[16rem] sm:max-w-xs  break-all  text-white  pt-1 text-sm    rounded-lg ${
                  message.sender._id === user._id
                    ? "bg-[rgb(38,141,97)]"
                    : "bg-[rgb(53,55,59)]"
                }`}
              >
                {decryption(message.content)}
              </span>
            </div>
          );
        })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;