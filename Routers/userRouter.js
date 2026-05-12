import express from "express";
import { createUser, loginUser } from "../Controllers/userControllers.js";
// Importing your function createUser
// ✔ This function handles:
// creating a new user in database


const userRouter = express.Router() // express.Router() is: A built-in function in Express used to create modular, organized route handlers (
// a route means:
// A path + method that tells the server what to do when a request comes
// 🧠 Simple meaning
// 👉 Route = URL + action)


userRouter.post("/", createUser)
userRouter.post("/login", loginUser) // here two post req , these r confucing when these both come as same , we have differ its pats like Frst one is for craetUser 2nd one is for loginUser
export default userRouter

// ("/") → path
// POST → method
// function → what to do

// Summary
// Router = traffic controller 🚦
// Route (post) = road
// Controller (createUser) = worker doing the job