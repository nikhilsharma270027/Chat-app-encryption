const router = express.Router();
import express from "express";
import  searchUser  from "../Controllers/UserController.js"
import {
    fetchChat,
    changeName,
    removeUser,
    addUser,
    accessChat,
    createGroup,
    saveMessage,
    fetchMessages,
    accessGroupChat,
    changePic,
    countUnseenMssge,
} from "../Controllers/ChatController.js";


router.get("/searchUser", searchUser); // will serach user based og search param
router.get("/accessChat", accessChat);
router.get("/fetchMessages", fetchMessages);
router.post("/message", saveMessage);
router.post("/createGroup", createGroup);
router.get("/accessGroupChat",  accessGroupChat);
router.get("/fetchChats",  fetchChat);
router.post("/changeName",  changeName);
router.get("/removeUser",  removeUser);
router.get("/changePic",  changePic);
router.post("/addUser", addUser);
router.get("/countMssg",  countUnseenMssge);


export default router;