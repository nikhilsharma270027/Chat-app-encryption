import 'dotenv/config'
import express from "express";
import cors from "cors"
import jwt from 'jsonwebtoken';
import http from "http"
import { Server } from 'socket.io';
import mongoose from "mongoose";
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt'
import User from './Schemas/User.js';
let PORT = 3000;
const uri = "mongodb+srv://nikhil:nikhil@chatapp.cwjik.mongodb.net/?retryWrites=true&w=majority&appName=chatapp";

const app = express();
const server = http.createServer(app);
// -----------------------------------------------------------------------
app.use(express.json()); // ✅ Ensure this is BEFORE defining routes
app.use(express.urlencoded({ extended: true })); // ✅ Helps handle form data (optional)

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Replace with your frontend domain
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies to be sent with requests
  optionsSuccessStatus: 204,
};

// Use CORS middleware with options
app.use(cors(corsOptions));

// Set Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin"); // Or 'unsafe-none'
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp"); // Optional, depending on your use case
  next();
});
const io = new Server(server, {
  cors: {
      origin: 'http://localhost:5173', // Allow requests from your React app
      methods: ['GET', 'POST'],
  },
});
mongoose
  .connect(process.env.DB_LOCATION, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    autoIndex: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// JWT Helper Function
const formattedData = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  console.log(access_token)
  return {
      access_token,
      profile_img: user.personal_info.profile_img,
      username: user.personal_info.username,
      fullname: user.personal_info.fullname,
  };
};
// jwt done

const GenerateUsername = async (email) => {
  if (!email || typeof email !== 'string') {
    throw new Error("Invalid email provided for username generation");
  }

  let username = email.split("@")[0]; // Extract the part before '@'

  let isUsernameNotUnique = await User.exists({ "personal_info.username": username });

  // If username exists, append random characters
  if (isUsernameNotUnique) {
    username += nanoid(5); // Shorter random string for readability
  }

  return username;
};

// Routes
app.post('/signup', async (req, res) => {
  try {
      const { fullname, email, password } = req.body;
      console.log("Request Body:", req.body); // Debugging
      // let usernameUnique =await  GenerateUsername(email);
      bcrypt.hash(password, 10, async ( err, hased_password ) => {

        let usernameUnique = await GenerateUsername(email ); //'as@gmail.com' -> [as, gmail] -> as
        console.log(usernameUnique)

        let user = new User({
            personal_info: { fullname, email, password: hased_password, username: usernameUnique, }
        })
        user.save().then((u)=> {//mongodb save method to save schema/userinfo
          // console.log(u)
            return res.status(200).json(formattedData(u))
        })
        .catch(err => {
            if(err.code === 11000){
                return res.status(500).json({ "error":"Email already exist" })
            }
            return res.status(500).json({ "error": err.message })
        })
        // console.log(hased_password);
    })
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

app.post('/signin', async (req, res) => {
  let { email, password } = req.body;

  User.findOne({ "personal_info.email": email })
  .then((user) => {
      if(!user) {
          return res.status(403).json({ 'error': "Email not found" });
      }
      if(!user.google_auth){

          bcrypt.compare(password, user.personal_info.password, (err, result)=> {
              if(err){
                  return res.status(403).json({ "error": "Error occured while login please try again!" })
              }
  
              if(!result) {
                  return res.status(403).json({ "error": "Incorrect password" })
              } else {
                  return res.status(200).json(formattedData(user))
              }
          })
      } else {
          return res.status(403).json({ "error": "Account was created using google. Try logging in with google" })
      }


      //console.log(user);
      //return res.json({ "status": "got user document" })
  })
  .catch(err => {
      console.log(err.message);
      return res.status(403).json({ "error": err.message })
  })
});

app.get('/messages', async (req, res) => {
  try {
      const { sender, receiver } = req.query;
      const messages = await Message.find({
          $or: [
              { sender, receiver },
              { sender: receiver, receiver: sender },
          ],
      }).sort({ timestamp: 1 }); // Sort by timestamp in ascending order
      res.status(200).json(messages);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});


// Socket.IO connection
// io.on('connection', (socket) => {
//   console.log('a user connected');

//   socket.on('chat message', (msg) => {
//       io.emit('chat message', msg); // Broadcast message to all users
//   });

//   socket.on('disconnect', () => {
//       console.log('user disconnected');
//   });
// });


io.on('connection', (socket) => {
  console.log('a user connected');

  // Join a room for the user (using their username or user ID)
  socket.on('join', (username) => {
      socket.join(username);
      console.log(`${username} joined the chat`);
  });

  // Handle private messages
  socket.on('private message', async ({ sender, receiver, message }) => {
      const newMessage = new Message({ sender, receiver, message });
      await newMessage.save();

      // Emit the message to the receiver's room
      io.to(receiver).emit('private message', newMessage);

      // Also emit the message to the sender (optional)
      io.to(sender).emit('private message', newMessage);
  });

  socket.on('disconnect', () => {
      console.log('user disconnected');
  });
});



app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || "Internal Server Error";
  res.status(status).send(message);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});