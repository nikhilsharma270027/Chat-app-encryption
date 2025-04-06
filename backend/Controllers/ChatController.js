import mongoose from "mongoose";
import { Message } from "../Schemas/Message.js";
import Chat from "../Schemas/chat-box.js";
import User from "../Schemas/User.js";

export const saveMessage = async (req, res) => {
  try {
    const { content, chatId, noty } = req.body;
    let message = await Message.create({
      content,
      sender: req.user,
      chatId,
    });

    if (noty) {
      message.noty = true;
      await message.save();
    }

    let chat = await Chat.findById(chatId);
    chat.latestMessage = message._id;
    await chat.save();

    let detailedMessage = await Message.findById(message._id)
      .populate("sender", "-password")
      .populate({
        path: "chatId",
        populate: { path: "users", populate: { path: "user" } },
      });

    return res.send(detailedMessage);
  } catch (error) {
    console.error("Error in saving message", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Function to fetch all previous messages of a chat
export const fetchMessages = async (req, res) => {
  try {
    const { Id } = req.query;
    const chatId = new mongoose.Types.ObjectId(Id);

    // Fetching messages from the database and populating the sender details
    const messages = await Message.find({ chatId }).populate(
      "sender",
      "-password"
    );
    return res.send(messages);
  } catch (error) {
    console.error("Error in fetching messages", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Function to fetch a list of recent chats for the logged-in user
export const fetchChat = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { user: new mongoose.Types.ObjectId(req.user) } },
    })
      .populate({
        path: "users",
        populate: { path: "user" },
      })
      .populate({
        path: "latestMessage",
        model: "message",
        populate: { path: "sender", model: "user" },
      })
      .populate("admin")
      .sort("-updatedAt");

    return res.send(chats);
  } catch (error) {
    console.error("Error in fetching chats", error.message);
    res.status(500).send("Internal Server Error");
  }
};  

// Function to fetch or create a single chat
export const accessChat = async (req, res) => {
  try {
    const { userTwo } = req.query;

    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { user: new mongoose.Types.ObjectId(userTwo) } } },
        { users: { $elemMatch: { user: new mongoose.Types.ObjectId(req.user._id) } } },
      ],
    })
      .populate({
        path: "users",
        populate: {
          path: "user",
          model: "user",
        },
      })
      .populate({
        path: "latestMessage",
        model: "message",
        populate: {
          path: "sender",
          model: "user",
          select: "name,email,avtar",
        },
      });

    if (isChat.length > 0) {
      return res.send(isChat[0]);
    } else {
      // If no chat exists, create a new chat
      let chat = await Chat.create({
        isGroupChat: false,
        users: [{ user: req.user._id }, { user: userTwo }],
      });

      let fullChat = await Chat.findById(chat._id)
        .populate({
          path: "users",
          populate: {
            path: "user",
            model: "user",
          },
        });

      return res.send(fullChat);
    }
  } catch (error) {
    console.error("Error in accessing chat", error.message);
    res.status(500).send("Internal Server Error");
  }
};

export const accessGroupChat = async (req, res) => {
    try {
        //fetching group chat with group id and populating group users
        //,latest message and latest message sender //
        const { chatId } = req.query;
        let chat = await Chat.findById(chatId)
            .populate({
                path: "users",
                populate: {
                path: "user",
                model: "user",
                },
            })
            .populate({
                path: "latestMessage",
                model: "message",
                populate: {
                    path: "sender",
                    model: "user",
                    select: "name,email,avtar",
                },
            })
            .populate("admin", "-password");

            //neutralising users unseen message count //
            chat.users.map((members) => {
                let memeberId = members.user._id.toString();
                if(memeberId === req.user) {
                    members.unseenMsg = 0;
                }
            });

            await chat.save();   
            return res.send(chat) ;
    } catch (error) {
        console.error("error in access group chat", error.message);
        res.status(200).send("Internal Server Error");
      }
};


// To create group
export const createGroup = async (req, res) => {
    try {
        // slected UsersId is an array , so push the users
        const { chatName, selectedUsersId, groupPicture } = req.body;
        // pushing log user in group members list //
        selectedUsersId.push({ user: req.user});
        if(selectedUsersId.length <= 2 ) {
            //firing waning if members are less then 2
            return res.status(400).json({
                error: true,
                message: "Minimum users should be three",
            });
        }

        // creating a new chat for groupchat/ grouped users
        let newChat = await Chat.create({
            chatname: chatName,
            isGroupChat: true,
            users: selectedUsersId,
            admin: req.user,
            profilepic: groupPicture,
        });

        // populate the user means 
        // we have already added the user 
        // now add the details of the users
        let FULLCHAT = await Chat.findById(newChat._id)
            .populate({
                path: "users",
                populate: {
                    path: "user",
                    model: "user"
                },
            })
            .populate("admin", "-password")
        
        return res.send(FULLCHAT);
    } catch (error) {
        console.error("error in creating group", error.message);
        res.status(200).send("Internal Server Error");
    }
}

// to change name of group chat or single chat //
export const changeName = async (req, res) => {
    try {
        // type: signlechat | group
        const { type, Id, name } = req.body;
        if(type == "group") {
            let chatId = mongoose.Types.ObjectId(Id);
            let chat  = await Chat.findById(chatId);
            chat.chatname = name;
            await chat.save();
            return res.send(chat);
        } else {
            let userId = mongoose.Types.ObjectId(Id);
            let user = await User.findById(userId).select("-password");
            user.name = name;
            await user.save();
            return res.send(user);
        }
    } catch (error) {
        console.error(error.message);
        res.status(200).send("Internal Server Error");
    }
}

//to remove user from group //
export const removeUser = async (req, res) => {
    try {
        const { chatId , userId } = req.query;
        let group = await Chat.findById(chatId);

        let index = -1;
        let count = 0;
        group.users.forEach((members) => {
            let memberId = members.user.toString();
            if ( memberId === userId ) {
                index = count;
                // if it encounter the loguser it will inc index
            }
            count++;
        })
        group.users.splice(index, 1);

        await group.save();

        return res.send({ success: true });
    } catch (error) {
        console.error("error in removing user", error.message);
        res.status(200).send("Internal Server Error");
    }
}

// to add user in group //
export const addUser = async (req, res) => {
    try {
        const { chatId, usersId } = req.body;
        let group = await Chat.findById(chatId);

        usersId.forEach((user) => {
          let index = group.users.findIndex(member => member.user.toString() === user.user);
          
          if (index === -1) { // If user is not already in the group
              group.users.push({ user: user.user, unseenMsg: 0 });
          }
      });
         await group.save();

         return res.send()
    } catch (error) {
        console.error("error in adding user", error.message);
        res.status(200).send("Internal Server Error");
    }
}

// to change profile picture of group chat or single chat //

export const changePic = async (req, res) => {
    try {
        const { isGroupChat, Id, pic } = req.query;

        if(isGroupChat != "false") {
            let chat = await Chat.findById(Id);
            chat.set({ prifilepic: pic });
            //use set so mongo will update quick
            await chat.save();
        } else {
            let user = await User.findById(Id);
            user.avatar = pic;
            await user.save();
        }
        return res.status(200).json({ success: true, message: "Profile picture updated" });
    } catch (error) {
        console.error("error in changing pic", error.message);
        res.status(200).send("Internal Server Error");
    }
}

// to update count of unseen messages //
export const countUnseenMssge = async (req, res) => {
    try {
        const { chatId, userId } = req.query;

        let chat = await Chat.findById(chatId).populate({
          path: "users",
          populate: {
            path: "user",
          },
        });

        chat.users.forEach((members) => {
          if(members.user._id == userId) {
            members.unseenMsg = 0;
          }
        })

        await chat.save();
        return res.send(chat.users);
    } catch (error) {
      console.error(error.message);
      res.status(200).send("Internal Server Error");
    }
}

//to add count of unseen messages //
export const addCount = async (chatId, userId) => {
  try {
    let chat = await  Chat.findById(chatId).populate({
      path: "users",
      populate: {
        path: "user",
      },
    });
    
    chat.users.forEach((members) => {
      if(members.user._id == userId) {
        members.unseenMsg = members.unseenMsg + 1;
      }
    });

    await chat.save();
    return chat.users;
  } catch (error) {
    console.error(error.message);
  }
}

// to get mutual groups
