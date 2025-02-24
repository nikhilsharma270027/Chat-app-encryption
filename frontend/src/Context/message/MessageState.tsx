import CryptoJS from "crypto-js";
import MessageContext from "./MessageContext";
import { ReactNode } from "react";

interface MessageStateProps {
    children: ReactNode;
  }
  
  const MessageState: React.FC<MessageStateProps> = ({ children }) => {
    const secretPass =  "default_secret";

    if (!secretPass) {
        console.error("Encryption secret is missing! Check your .env file.");
    }

    const encryption = (message : string): any => {
        if (!secretPass) return null; // Prevent encryption without key
        return CryptoJS.AES.encrypt(JSON.stringify(message), secretPass).toString();
    }

    const decryption = (message : string): any => {
        try{
            if (!secretPass) return null; // Prevent encryption without key
            var bytes  = CryptoJS.AES.decrypt(message, 'secret key 123');
            var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            return decryptedData;

        } catch(error) {
            console.error("Decryption failed:", error);
            return null; // Return null if decryption fails
        }
    }

    return (
        <MessageContext.Provider value={{ encryption, decryption }}>
            {children}
        </MessageContext.Provider> 
    );
}

export default MessageState;