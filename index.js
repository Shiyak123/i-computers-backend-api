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
import cors from "cors"
import dotenv from "dotenv";
import dns from "node:dns";

import { loginUser } from './Controllers/userControllers.js';
import studentRouter from './Routers/studentRouter.js';
import userRouter from './Routers/userRouter.js';
import authenticate from './Middlewares/authenticate.js';
import productRouter from './Routers/productRouter.js';
import orderRouter from './Routers/orderRouter.js';
dotenv.config(); //dotenv kiyna function eke monwhri varible ekk thibbuth me function eke run wey 

// Use custom DNS servers in local development environments if needed (e.g. Windows SRV lookups)
if (process.env.NODE_ENV !== "production") {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
}


//1. Creates the Express app (This creates a server application.)
const app = express();

app.use(cors())
app.use(express.json())

//2. Adds middlewares (This allows the server to understand JSON requests like:)
const mongoDBurl = process.env.MONGO_DB_URL

mongoose.connect(mongoDBurl)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });



// 🧠 Easy understanding

// 👉 Authorization = carries token
// 👉 "Bearer " = just a prefix
// 👉 replace() = extract real token
// 👉 jwt.verify() = check if token is real


// Root health check endpoint for monitoring and cloud deployment platforms
app.get("/", (req, res) => {
    res.send("I-COMPUTERS API is running");
});

// In index.js
app.post("/api/users/login", loginUser);
app.use(authenticate)
// 3. Connects routes (VERY IMPORTANT)
// This means:
// Any request starting with /users
// Go to userRouter
app.use("/api/users", userRouter); // this handles user routes (POST / is public in authenticate, GET/PUT protected in controller)
app.use("/api/students", studentRouter) // this handles stdnt routs
app.use("/api/products", productRouter)
app.use("/api/orders", orderRouter)
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
// 2. Adds middlewares (This allows the server to understand JSON requests like:) pluging the routers into main app



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
// 3. Connects routes (VERY IMPORTANT)  (This actually makes the backend live and waiting for requests.)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started successfully, listening on port ${PORT}`);
});

// import express from 'express';
// import mongoose from 'mongoose';
// import cors from "cors";
// import dotenv from "dotenv";
// import userRouter from './Routers/userRouter.js';
// import studentRouter from './Routers/studentRouter.js';
// import productRouter from './Routers/productRouter.js';
// import authenticate from './Middlewares/authenticate.js';

// dotenv.config();
// const app = express();

// // 1. Middlewares
// app.use(cors());
// app.use(express.json());

// // 2. Database Connection
// mongoose.connect(process.env.Mongo_Url)
//     .then(() => console.log("MongoDB connected"))
//     .catch((err) => console.log("DB Error:", err));

// // 3. Public Routes (No token needed)
// app.use("/users", userRouter);

// // 4. Protected Routes (Token needed)
// app.use(authenticate);
// app.use("/students", studentRouter);
// app.use("/products", productRouter);

// // 5. Start Server
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
