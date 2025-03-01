// import CryptoJS from "crypto-js";
// import MessageContext from "./MessageContext";
// import { ReactNode } from "react";

// interface MessageStateProps {
//     children: ReactNode;
//   }
  
//   const MessageState: React.FC<MessageStateProps> = ({ children }) => {
//     const secretPass =  "default_secret";

//     if (!secretPass) {
//         console.error("Encryption secret is missing! Check your .env file.");
//     }

//     const encryption = (message : string): any => {
//         if (!secretPass) return null; // Prevent encryption without key
//         return CryptoJS.AES.encrypt(JSON.stringify(message), secretPass).toString();
//     }

//     const decryption = (message : string): any => {
//         try{
//             if (!secretPass) return null; // Prevent encryption without key
//             var bytes  = CryptoJS.AES.decrypt(message, secretPass);
//             var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
//             return decryptedData;

//         } catch(error) {
//             console.log("Decryption failed:", error);
//             return null; // Return null if decryption fails
//         }
//     }

//     return (
//         <MessageContext.Provider value={{ encryption, decryption }}>
//             {children}
//         </MessageContext.Provider> 
//     );
// }

// export default MessageState;
import CryptoJS from "crypto-js";
import MessageContext from "./MessageContext";
import { ReactNode } from "react";

interface MessageStateProps {
    children: ReactNode;
}

const MessageState: React.FC<MessageStateProps> = ({ children }) => {
    const secretPass = import.meta.env.VITE_SECRET_KEY || "default_secret";


    if (!secretPass) {
        console.error("Encryption secret is missing! Check your .env file.");
    }

    const encryption = (message: string): string => {
        if (!secretPass) {
            console.error("Encryption key is missing!");
            return ""; // Return an empty string instead of null
        }
        return CryptoJS.AES.encrypt(JSON.stringify(message), secretPass).toString();
    };
    
    const decryption = (message: string): any => {
        try {
            console.log("Encrypted message received:", message);
            if (!message) throw new Error("No message provided for decryption");
    
            let bytes = CryptoJS.AES.decrypt(message, secretPass);
            let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    
            if (!decryptedData) throw new Error("Decryption resulted in an empty string");
    
            return JSON.parse(decryptedData);
        } catch (error) {
            console.error("Decryption failed:", error);
            return null; 
        }
    };
    
    

    return (
        <MessageContext.Provider value={{ encryption, decryption }}>
            {children}
        </MessageContext.Provider>
    );
};

export default MessageState;
