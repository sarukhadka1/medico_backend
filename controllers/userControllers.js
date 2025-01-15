const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendOtp = require('../service/sendOtp');

const createUser = async (req, res) => {
    console.log(req.body);

    const { firstName, middleName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password || !phone) {
        return res.json({
            success: false,
            message: "Please enter all required fields!"
        });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        return res.json({
            success: false,
            message: "Please enter a valid phone number!"
        });
    }

    try {
        const existingUser = await userModel.findOne({ email: email });

        if (existingUser) {
            return res.json({
                success: false,
                message: "User already exists!"
            });
        }

        const randomSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, randomSalt);

        const newUser = new userModel({
            firstName,
            middleName: middleName || "",
            lastName,
            email,
            phone,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "User created successfully!"
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "Internal server error!"
        });
    }
};

const loginUser = async (req, res) => {
    console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please enter all fields!"
        });
    }

    try {
        const user = await userModel.findOne({ email: email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User does not exist!"
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: "Password is incorrect!"
            });
        }

        const token = await jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET
        );

        res.status(201).json({
            success: true,
            message: "User logged in successfully!",
            token: token,
            userData: user
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "Please enter all fields!"
        });
    }
};

const getUserProfile = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUserProfile = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { firstName, middleName, lastName, phone, password } = req.body;
        if (firstName) user.firstName = firstName;
        if (middleName) user.middleName = middleName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (password) user.password = await bcrypt.hash(password, 10);

        await user.save();
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const forgotPassword = async (req, res) => {
    console.log(req.body);

    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: "Please enter your phone number",
        });
    }
    try {
        const user = await userModel.findOne({ phone: phone });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const randomOTP = Math.floor(100000 + Math.random() * 900000);
        console.log(randomOTP);

        user.resetPasswordOTP = randomOTP;
        user.resetPasswordExpires = Date.now() + 600000;
        await user.save();

        const isSent = await sendOtp(phone, randomOTP);

        if (!isSent) {
            return res.status(400).json({
                success: false,
                message: "Error in sending OTP",
            });
        }

        res.status(200).json({
            success: true,
            message: "OTP sent to your phone number",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const verifyOtpAndSetPassword = async (req, res) => {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Required fields are missing!'
        });
    }
    try {
        const user = await userModel.findOne({ phone: phone });

        if (user.resetPasswordOTP != otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP!'
            });
        }
        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired!'
            });
        }

        const randomSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, randomSalt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'OTP verified and password updated!'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error!'
        });
    }
};

const getCurrentProfile = async (req, res) => {
  // const id = req.user.id;
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded =jwt.verify(token,process.env.JWT_SECRET);
   
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};

  const getToken = async (req, res) => {
    try {
      console.log(req.body);
      const { id } = req.body;
 
      const user = await userModel.findById(id);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found',
        });
      }
 
      const jwtToken = await jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        (options = {
          expiresIn:
            Date.now() + process.env.JWT_TOKEN_EXPIRE * 24 * 60 * 60 * 1000 ||
            '1d',
        })
      );
 
      return res.status(200).json({
        success: true,
        message: 'Token generated successfully!',
        token: jwtToken,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: error,
      });
    }
  };

module.exports = {
    createUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    verifyOtpAndSetPassword,
    getToken,
    getCurrentProfile,
};
