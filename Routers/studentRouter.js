// this file is created to make separate funcitions which were on student Router
import express from 'express';
import { createStudent, getAllstudentsNew } from '../Controllers/studentControllers.js';


const studentRouter = express.Router()
// here (.Ruoter)is in build model on express.js used to get empty device(module) to manage every req come froom students 

//Get req
studentRouter.get("/", getAllstudentsNew)

//post req
studentRouter.post("/", createStudent)

// make sure this moduler, can be used for outers
export default studentRouter