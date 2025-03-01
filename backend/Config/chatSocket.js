import { addCount } from "../Controllers/ChatController.js";
// const { addCount } = ChatController;
import { Server } from "socket.io"
export const chatSocket = (socket) => {
    // const io = new Server(socket, {
    //     cors: {
    //         origin: "http://localhost:5173",
    //     }
    // });
    var io = socket
    // Setup socket connection
    io.on("connection", (socket) => {
        console.log("A user connected");
      
        socket.on("setup", (userData) => {
          socket.join(userData?._id);
          console.log("User joined:", userData.username);
          socket.emit("Connected");
        });


        //new message triggered//
        socket.on("new_message", (message) => {
          var chat = message.chatId;
          if(!chat.users) return console.log("Chat Users not defined");
          chat.users.forEach((members) => {
            if(members.user._id === members.sender._id) return;//Checks if the chat has users; if not, it logs an error.
            let data = {
              message: message,
              receiverId: members.user._id,
            };
            socket.in(members.user._id).emit("message_received", data);
          });

          if (message.removedUserId) {//If the message contains removedUserId, it means a user was removed from the chat.
            let data = {
              message: message,
              receiverId: message.removedUserId,
            };
            socket.in(message.removedUserId).emit("message_received", data);
          }
        })


         // update recent message //

        socket.on("update_Chatlist", (message) => {
          var chat = message.chatId;
          if (!chat.users) return console.log("chat users not defined");
          chat.users.forEach(async (members) => {
            if (members.user._id === message.sender._id) return;
            let users = await addCount(message.chatId._id, members.user._id);
            let data = {
              message: message,
              users: users,
            };
            socket.in(members.user._id).emit("latest_message", data);
          });

          if (message.removedUserId) {
            let data = {
              message: message,
              receiverId: message.removedUserId,
            };
            socket.in(message.removedUserId).emit("latest_message", data);
          }
        });
      


        // Toggle typing
        socket.on("toggleTyping", (data) => {
          data.chat.users.forEach((members) => {
            if(members.user._id == data.user._id) return;
              socket.in(members.user._id).emit('isTyping', data)
          })
        })



        socket.on("disconnect", () => {
          console.log("A user disconnected");
        });




      });
}