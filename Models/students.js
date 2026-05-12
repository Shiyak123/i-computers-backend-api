// this file is used to make separate DB modules as collecttions

import mongoose from "mongoose";
//creatng a schema for remote service that's mongoose model which r disribe atribtes of ollection (table)
//2nd step cereating an obj for declering that schema on Json model
const studentSchema = new mongoose.Schema(
    {
        name: String,
        age: Number,
        city: String
    }
)
//1st step: This code used for making or creating somting llie a remote which is used to control whole studnet collection on mongo DB
// And also we have to give two parameters on the bra above as we are exploring about that remote's name 
//And also we have a discription (schema) about that collection(Student)
const Student = mongoose.model("student", studentSchema)
// givng the pass for the remote ( which we r created to control Student collection )to be accessed from  outside
export default Student  
