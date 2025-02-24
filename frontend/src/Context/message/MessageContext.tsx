import { createContext } from "react";

interface MessageContextType {
  encryption: (message: string) => string;
  decryption: (message: string) => string;
}

const MessageContext = createContext<MessageContextType>({
  encryption: () => "", // Default empty function
  decryption: () => "",
});

export default MessageContext;
