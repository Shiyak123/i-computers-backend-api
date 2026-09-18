import User from "../Models/users.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

export async function createUser(req, res) {
    try {
        const email = req.body.email ? req.body.email.toLowerCase().trim() : "";
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const ExistingUser = await User.findOne({ email: email })
        if (ExistingUser != null) {
            res.json({ message: "User already exists here" })
            return
        }
        //CRAETING A NEW USER
        const passwordHash = bcrypt.hashSync(req.body.password, 10)
        const newUser = new User({
            email: email,
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
        const email = req.body.email ? req.body.email.toLowerCase().trim() : null;
        const password = req.body.password;

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

            // Blocked check
            if (user.isBlocked) {
                return res.status(403).json({
                    message: "Your account has been blocked. Please contact support."
                });
            }

            // 3. Generate Token
            const token = jwt.sign({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isAdmin: user.isAdmin,
                isBlocked: user.isBlocked,
                isEmailVarified: user.isEmailVarified,
                image: user.Image || user.image
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

// GET ALL USERS (ADMIN ONLY, NO PASSWORDS RETURNED)
export async function getAllUsers(req, res) {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin privileges required" });
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit) || 1;

        // Exclude password and sensitive internal fields
        const users = await User.find({}, { password: 0, __v: 0 })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            users,
            totalUsers,
            totalPages,
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// TOGGLE USER BLOCK STATE (ADMIN ONLY, PREVENTS SELF-BLOCKING)
export async function updateUserState(req, res) {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin privileges required" });
    }

    try {
        const targetEmail = req.params.email;

        // Self-protection check
        if (targetEmail.toLowerCase() === req.user.email.toLowerCase()) {
            return res.status(400).json({ message: "You cannot change your own account block state" });
        }

        const user = await User.findOne({ email: targetEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({
            message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
            isBlocked: user.isBlocked,
            email: user.email
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// TOGGLE USER ROLE (ADMIN ONLY, PREVENTS SELF-DEMOTION)
export async function switchRole(req, res) {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin privileges required" });
    }

    try {
        const targetEmail = req.params.email;

        // Self-protection check
        if (targetEmail.toLowerCase() === req.user.email.toLowerCase()) {
            return res.status(400).json({ message: "You cannot change your own administrator role" });
        }

        const user = await User.findOne({ email: targetEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isAdmin = !user.isAdmin;
        await user.save();

        res.json({
            message: `User role changed to ${user.isAdmin ? "Admin" : "Customer"} successfully`,
            isAdmin: user.isAdmin,
            email: user.email
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// In-memory store for OTP records: email -> { otpHash, expiresAt, attempts }
const otpStore = new Map();

// FORGOT PASSWORD - REQUEST OTP
export async function forgotPassword(req, res) {
    try {
        dotenv.config(); // Refresh environment variables from .env
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({ message: "Email address is required." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Check if user exists in database
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: "No account found with this email address." });
        }

        // 2. Check if user account is blocked
        if (user.isBlocked) {
            return res.status(403).json({ message: "This account has been blocked. Please contact store support." });
        }

        // 3. Check for email service configuration (supports EMAIL_USER/EMAIL_PASS and Email/APP_PASSWORD)
        const emailUser = process.env.EMAIL_USER || process.env.EMAIL || process.env.Email;
        const emailPass = process.env.EMAIL_PASS || process.env.APP_PASSWORD || process.env.EMAIL_PASSWORD;

        if (!emailUser || !emailPass) {
            console.warn(`[Forgot Password] Reset requested for ${normalizedEmail}, but EMAIL_USER or EMAIL_PASS is not configured in backend .env.`);
            return res.status(503).json({
                message: "Email service is not configured on the server. Please configure EMAIL_USER and EMAIL_PASS environment variables.",
                configured: false
            });
        }

        // 4. Generate 6-digit numeric OTP and secure hash
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = bcrypt.hashSync(otp, 10);
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        otpStore.set(normalizedEmail, {
            otpHash,
            expiresAt,
            attempts: 0
        });

        // 5. Send OTP via Nodemailer
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || "gmail",
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        const mailOptions = {
            from: `"I-COMPUTERS Support" <${emailUser}>`,
            to: normalizedEmail,
            subject: "Your Password Reset OTP - I-COMPUTERS",
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #001A84;">
                        <h2 style="color: #001A84; margin: 0; font-size: 24px; letter-spacing: -0.5px;">I-COMPUTERS</h2>
                        <p style="color: #64748b; font-size: 13px; margin: 6px 0 0 0;">Password Reset Verification</p>
                    </div>
                    <div style="padding: 24px 0;">
                        <p style="color: #0f172a; font-size: 15px; margin: 0 0 12px 0;">Hello <strong>${user.firstName || "Customer"}</strong>,</p>
                        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                            We received a request to reset your I-COMPUTERS account password. Enter the 6-digit verification code below to proceed:
                        </p>
                        <div style="text-align: center; margin: 28px 0;">
                            <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #001A84; background: #eff6ff; padding: 14px 28px; border-radius: 10px; border: 1.5px dashed #2563eb;">
                                ${otp}
                            </span>
                        </div>
                        <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 8px 0;">
                            • This code is valid for <strong>10 minutes</strong>.<br>
                            • For security reasons, do not share this code with anyone.
                        </p>
                        <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0 0;">
                            If you did not request this password reset, please ignore this email or contact support if you suspect unauthorized access.
                        </p>
                    </div>
                    <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
                        &copy; ${new Date().getFullYear()} I-COMPUTERS. All rights reserved.
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.json({
            message: "OTP has been sent to your email address.",
            configured: true
        });
    } catch (err) {
        console.error("[Forgot Password SMTP Error]:", err.message);
        return res.status(500).json({
            message: "Failed to deliver OTP email. Please verify that the SMTP credentials and Gmail App Password are valid.",
            configured: true
        });
    }
}

// RESET PASSWORD - VERIFY OTP & UPDATE PASSWORD
export async function resetPassword(req, res) {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, OTP code, and new password are all required." });
        }

        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Retrieve OTP record
        const record = otpStore.get(normalizedEmail);
        if (!record) {
            return res.status(400).json({ message: "No active password reset request found. Please request a new OTP." });
        }

        // 2. Check expiration
        if (Date.now() > record.expiresAt) {
            otpStore.delete(normalizedEmail);
            return res.status(400).json({ message: "OTP code has expired. Please request a new OTP." });
        }

        // 3. Limit brute-force attempts
        if (record.attempts >= 5) {
            otpStore.delete(normalizedEmail);
            return res.status(429).json({ message: "Too many failed attempts. Please request a new OTP." });
        }

        // 4. Verify OTP code match
        const isOtpValid = bcrypt.compareSync(otp.toString().trim(), record.otpHash);
        if (!isOtpValid) {
            record.attempts += 1;
            return res.status(400).json({ message: "Invalid OTP code. Please check your email and try again." });
        }

        // 5. Update user password in database
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: "User account not found." });
        }

        const passwordHash = bcrypt.hashSync(newPassword, 10);
        user.password = passwordHash;
        await user.save();

        // 6. Invalidate OTP after successful reset
        otpStore.delete(normalizedEmail);

        return res.json({
            message: "Password reset successfully! You can now log in with your new password."
        });
    } catch (err) {
        console.error("[Reset Password Error]:", err.message);
        return res.status(500).json({ message: "An unexpected error occurred while resetting your password. Please try again." });
    }
}