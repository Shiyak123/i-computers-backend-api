import jwt from "jsonwebtoken";

export default function authenticate(req, res, next) {
    const header = req.header("Authorization");

    if (!header) {
        return next(); // allow public routes
    }

    const token = header.replace("Bearer ", "");

    jwt.verify(token, "secretkey99!!!!!", (err, decoded) => {
        if (err || decoded == null) {
            return res.status(401).json({ message: "Invalid token, please login again" });
        }

        req.user = decoded;
        next();
    });
}

// import jwt from "jsonwebtoken"

// export default function authenticate(req, res, next) {
//     const header = req.header("Authorization")

//     // ❌ Do NOT allow without token
//     if (!header) {
//         return res.status(401).json({
//             message: "No token provided"
//         })
//     }

//     // ✅ Correct way (remove "Bearer " with space)
//     const token = header.replace("Bearer ", "")

//     jwt.verify(token, "secretkey99!!!!!", (err, decoded) => {  //If token is invalid:
//         // err ❗ will NOT be null
//         // decoded ❌ will be undefined

//         // ❌ handle error properly
//         if (err) {
//             return res.status(401).json({
//                 message: "Invalid token"
//                 // This already covers:
//                 // Expired token
//                 // Wrong token
//                 // Tampered token
//             })
//         }

//         // ✅ attach user ==>Then this runs only if valid
//         req.user = decoded

//         next()
//     })
// }
