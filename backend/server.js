import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

// external imports
import connectDB from "./Config/mongoose.js";
import { chatSocket } from "./Config/chatSocket.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chatRoute.js"

// Setup __dirname in ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Replace with your frontend domain
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies to be sent with requests
  optionsSuccessStatus: 204,
};

// Use CORS middleware with options
app.use(cors(corsOptions));
app.use(express.json()); // ✅ Ensure this is BEFORE defining routes
app.use(express.urlencoded({ extended: true })); // ✅ Helps handle form data (optional)
// Use __dirname correctly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Chat Socket Setup
const chatServer = http.createServer(app);
chatSocket(chatServer);

chatServer.listen(4000, (err) => {
  if (err) {
    console.log("Error in listening chat server");
  } else {
    console.log("Chat server is running successfully on port : 4000");
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// ------------------------Deployment---------------
app.use(express.static(path.join(__dirname, "frontend_build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend_build", "index.html"));
});

// Set Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin"); // Or 'unsafe-none'
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp"); // Optional, depending on your use case
  next();
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || "Internal Server Error";
  res.status(status).send(message);
});

// ------------------------Start Main Server---------------
app.listen(PORT, (err) => {
  
  if (err) {
    console.log("Error in running server on port", PORT);
  } else {
    console.log("Server is running successfully on port:", PORT);
  }
});
