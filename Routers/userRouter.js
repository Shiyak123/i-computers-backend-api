import express from "express";
import { createUser, loginUser, getAllUsers, updateUserState, switchRole } from "../Controllers/userControllers.js";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/", getAllUsers);
userRouter.put("/state/:email", updateUserState);
userRouter.put("/role/:email", switchRole);

export default userRouter;

// ("/") → path
// POST → method
// function → what to do

// Summary
// Router = traffic controller 🚦
// Route (post) = road
// Controller (createUser) = worker doing the job