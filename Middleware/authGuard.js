const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
 
// const authGuard =  async (req, res, next) => {
//     const authHeader = req.headers.authorization;
 
//     if (!authHeader) {
//         return res.status(400).json({
//             success: false,
//             message: "Auth header not found"
//         });
//     }
 
//     const token = authHeader.split(" ")[1];
 
//     if (!token || token ==="") {
//         return res.status(400).json({
//             success: false,
//             message: "Token not found!"
//         });
//     }
 
//     try {
//         const decodedUserData = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = await User.findById(decodedUserData.id).select("-password");
//         next();
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: "Not authenticated!"
//         });
//     }
// };


const authGuard = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authorization header is missing"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token is missing"
        });
    }

    try {
        const decodedUserData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedUserData.id).select("-password");

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(401).json({
            success: false,
            message: error.name === "TokenExpiredError" ? "Token has expired" : "Invalid token"
        });
    }
};




 
const adminGuard = (req, res, next) => {
    const authHeader = req.headers.authorization;
 
    if (!authHeader) {
        return res.status(400).json({
            success: false,
            message: "Auth header not found"
        });
    }
 
    const token = authHeader.split(" ")[1];
 
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Token not found!"
        });
    }
 
    try {
        const decodedUserData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedUserData;
 
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Permission Denied!"
            });
        }
 
        next();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Not authenticated!"
        });
    }
};
 
module.exports = {
    authGuard,
    adminGuard
};
