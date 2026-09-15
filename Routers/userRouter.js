import express from "express";
import { createUser, loginUser, getAllUsers, updateUserState, switchRole, forgotPassword, resetPassword } from "../Controllers/userControllers.js";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
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