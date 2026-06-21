// this file is used to make separate the Requestes 
// What happens inside index.js?
// Usually it does 4 main things:
// 1. Creates the Express app (This creates your server application.)
// 2. Adds middlewares (This allows your server to understand JSON requests like:)
// 3. Connects routes (VERY IMPORTANT) ()
// 4. Starts the server (This actually makes your backend live and waiting for requests.)

import express from 'express'
import mongoose from 'mongoose'
//import Student from './models/Student.js';

import dns from "node:dns";
import studentRouter from './Routers/studentRouter.js';
import userRouter from './Routers/userRouter.js';
import authenticate from './Middlewares/authenticate.js';
import productRouter from './Routers/productRouter.js';
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import dotenv from "dotenv"
import cors from "cors"
dotenv.config() //dotenv kiyna function eke monwhri varible ekk thibbuth me function eke run wey 


//1. Creates the Express app (This creates a server application.)
const app = express()

const mongoDBurl = process.env.Mongo_Url


mongoose.connect(mongoDBurl)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });

// 2. Adds middlewares (This allows the server to understand JSON requests like:) pluging the routers into main app
app.use(express.json())
app.use(authenticate)
app.use(cors())
// Request comes
//    ↓
// Check Authorization header
//    ↓
// No token → allow request
//    ↓
// Has token → verify
//    ↓
// Valid → allow
// Invalid → block

// 🧠 Easy understanding

// 👉 Authorization = carries token
// 👉 "Bearer " = just a prefix
// 👉 replace() = extract real token
// 👉 jwt.verify() = check if token is real



// 3. Connects routes (VERY IMPORTANT)
// This means:
// Any request starting with /users
// Go to userRouter
app.use("/students", studentRouter) // this handles stdnt routs
app.use("/users", userRouter) // this handles usr routs
app.use("/products", productRouter)

// // this req is used for 
// app.get("/",
//     (req, res) => {
//         Student.find().then(
//             (students) => {
//                 res.json(students)
//             }
//         )

//     }
// )

// // this req is used for adding new commers
// app.post(
//     "/",
//     (req, res) => {
//         //post req eken ena stdent details tika DB eke save karganna space 1k thayariththal (pudichhci weythal)
//         const newStudent = new Student(req.body)
//         // aal wanda pirgu anda edattil awarai pidiththu weyththal
//         newStudent.save().then(
//             () => {
//                 res.json(
//                     {
//                         message: "The Student has added successfully"

//                     }
//                 )
//             }
//         )

//     }
// )

// app.patch("/",
//     (req, res) => {
//         console.log(req.body)
//         console.log("patch request is recieved")
//     }
// )

// app.delete("/",
//     (req, res) => {
//         console.log(req.body)
//         console.log("delete request is recieved")
//     }
// )

// app.put("/",
//     (req, res) => {
//         console.log(req.body)
//         console.log("post reqest is recieved")
//     }
// )

// 3. Connects routes (VERY IMPORTANT)  (This actually makes the backend live and waiting for requests.)
app.listen(3000,
    () => {
        console.log("the server has started successfully")
        console.log("listening on port no 3000")
    }
)