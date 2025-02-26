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
      
        socket.on("disconnect", () => {
          console.log("A user disconnected");
        });
      });
}