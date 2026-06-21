import User from "../Models/users.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export async function createUser(req, res) {
    try {
        // wt we r going to carete a variable  below like "user",it's for savig a new user on tht varibale while it has to be checked wether another usr has found or not on this same eamil adrs or not,
        const ExistingUser = await User.findOne({ email: req.body.email }) // me req eke body eka ethule dala aapu mail eke user la innawnm kiynna(“Is there already a user with this email?) (it's called like adding vaidation for the perticuler mail)
        if (ExistingUser != null) {
            res.json({ message: "User already exists here" })
            return // if a user not exits there the prgrm should be stoped here, not be excuted below coding area
        }
        //CRAETING A NEW USER
        const passwordHash = bcrypt.hashSync(req.body.password, 10)
        //const newUser= new User(req.body) // this types of decalring vairable not safe cz someone can easily manupulate this one "isAdimin" like making it TRUE or FALSE
        //so we have make it as manualy doing that one
        const newUser = new User({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: passwordHash
        })
        await newUser.save()

        res.json({
            message: "User created successfully"
        })
    } catch (err) {
        res.json({ message: err.message })
    }
}


//LOGIN USERS password security
export async function loginUser(req, res) {
    try {
        const email = req.body.email
        const password = req.body.password

        if (email == null || password == null) {
            //res.json({ message: "Email and Passowrd are required to sign in" })
            // this is failt which happens from the users' inputs, so we have to make notice this one by standerd (status code) which is 400
            // so, with status code 
            res.status(400).json({ message: "Email and password are required to sign in" })
            return
        }
        // check the perticuler user has found on same email adrs
        const user = await User.findOne({ email: email })
        if (user == null) {
            //  404 not found status code which is used to can not find somthig
            //res.json({ message: "The user not found" }) // nrmal reguler code
            res.status(404).json({ message: "Not Found" })
            return
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password)
        if (isPasswordValid) {
            // creating jwt TOKEN for authorised people for accessing .... its like a ID card
            // res.json({ message: "Login Successful" })


            // SINGINING PROCESS      
            const token = jwt.sign({
                // we have to give some important details which r must be hide in ID(TOKAN)

                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isAdmin: user.isAdmin,
                isBlocked: user.isBlocked,
                isEmailVarified: user.isEmailVarified,
                image: user.image
            },
                // and we have to give unprictable key for that user
                "process.env.JWT_key"

            )
            res.json({ message: "Login Successful", token: token })


        } else {
            // If  sent the input was wrong (Unauthorized),401
            res.status(401).json({ message: "Invalid Password" })

            //res.json({ message: "Invalid Password" }) (normal method)
        }
    } catch (err) {
        res.json({ message: err.message })
    }
}


// They differ because:
// First one = auto takes all user input (unsafe)
// Second one = manually controls data (secure)