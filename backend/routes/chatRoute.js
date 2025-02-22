import express from "express";
import UserController from "../Controllers/UserController";
const router = express.Router();

router.get("/searchUser", UserController.searchUser()) // will serach user based og search param

export default router;