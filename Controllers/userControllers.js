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
// export async function loginUser(req, res) {
//     try {
//         const { email, password } = req.body;
//         console.log("Login attempt for:", email); // DEBUG 1

//         const user = await User.findOne({ email: email });
//         console.log("User found in DB:", user ? "YES" : "NO"); // DEBUG 2

//         if (user == null) {
//             return res.status(404).json({ message: "Not Found" });
//         }

//         const isPasswordValid = bcrypt.compareSync(password, user.password);
//         console.log("Is Password Valid:", isPasswordValid); // DEBUG 3

//         if (isPasswordValid) {
//             // creating jwt TOKEN for authorised people for accessing .... its like a ID card
//             // res.json({ message: "Login Successful" })

//             // SINGINING PROCESS      
//             const token = jwt.sign({
//                 // we have to give some important details which r must be hide in ID(TOKAN)

//                 email: user.email,
//                 firstName: user.firstName,
//                 lastName: user.lastName,
//                 isAdmin: user.isAdmin,
//                 isBlocked: user.isBlocked,
//                 isEmailVarified: user.isEmailVarified,
//                 image: user.image
//             },
//                 // and we have to give unprictable key for that user
//                 process.env.JWT_key

//             )
//             res.json({ message: "Login Successful", token: token })


//         } else {
//             // If  sent the input was wrong (Unauthorized),401
//             res.status(401).json({ message: "Invalid Password" })

//             //res.json({ message: "Invalid Password" }) (normal method)
//         }
//     } catch (err) {
//         res.json({ message: err.message })
//     }
// }


// They differ because:
// First one = auto takes all user input (unsafe)
// Second one = manually controls data (secure)

export async function loginUser(req, res) {
    try {
        const email = req.body.email
        const password = req.body.password

        // Debug: Log the attempt
        console.log("Login attempt for:", email);

        if (email == null || password == null) {
            return res.status(400).json({ message: "Email and password are required to sign in" })
        }

        // 1. Search Database
        const user = await User.findOne({ email: email })

        if (user == null) {
            console.log("Result: User not found in DB");
            return res.status(404).json({ message: "Not Found" }) // Added 'return' to stop execution
        }

        // 2. Validate Password
        const isPasswordValid = bcrypt.compareSync(password, user.password)

        if (isPasswordValid) {
            console.log("Result: Password Correct");

            // 3. Generate Token
            const token = jwt.sign({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isAdmin: user.isAdmin,
                isBlocked: user.isBlocked,
                isEmailVarified: user.isEmailVarified,
                image: user.image
            },
                process.env.JWT_key, {
                expiresIn: '1h' // Token expires in 1 hour
            }
            )

            // Send Success Response
            return res.json({
                message: "Login Successful",
                token: token,
                isAdmin: user.isAdmin ? true : false
            });

        } else {
            console.log("Result: Invalid Password");
            return res.status(401).json({ message: "Invalid Password" }) // Added 'return'
        }

    } catch (err) {
        console.log("Database Error:", err.message);
        return res.status(500).json({ message: err.message })
    }
}