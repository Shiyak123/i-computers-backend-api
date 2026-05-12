import mongoose, { Schema } from "mongoose";

// creat a Schema for the user ( when we craete a module we have to consider about 2 thigs 1. is user nd 2 is user schema)
//1. user Schema
const userSchema = new mongoose.Schema(
    {
        //1st Step (just declare the varible withot explanaion)
        //email : String,
        //2nd step (with proper explantion)
        email: {
            type: String,
            unique: true, // for making sperate the email id for each every users they cnt use many email for each one instead of evry one have to be one accont per one mail ID
            required: true, // for make the email option is mendatory no cn cn login wtout  mail adrs


        },
        firstName: {
            type: String,
            required: true
        },

        lastName: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: true
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false //the new user must be saved as non admin by defult
        },
        isBlocked: {
            type: Boolean,
            required: true,
            default: false
        },
        isEmailVrified: {
            type: Boolean,
            required: true,
            default: false

        },
        // usually we dnt store the imgs on db instead of its refrences that is why declare the iimg varibale as String
        Image: {
            type: String,
            required: true,
            default: "/default-profile.png"
        }
    }
)

// NOW we have to craeate a module for user
// 02. user module
const User = mongoose.model("User", userSchema)
export default User