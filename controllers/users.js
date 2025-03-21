const User = require("../models/users");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const crpyto = require("crypto");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const generateOTP = () => {
  return crpyto.randomInt(100000, 999999).toString();
};

const sendOTP = async (firstName, email, otp) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_EMAIL,
    templateId: process.env.SENDGRID_TEMPLATE_ID,
    dynamicTemplateData: {
      firstName: firstName,
      otp: otp,
    },
  };
  await sgMail.send(msg);
};

const sendVerificationEmail = async (firstName, email, token) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_EMAIL,
    templateId: process.env.SENDGRID_TEMPLATE_ID_FOR_VERIFICATION,
    dynamicTemplateData: {
      firstName: firstName,
      resetLink: token,
    },
  };
  await sgMail.send(msg);
};

exports.getAll = async (req, res) => {
  try {
    console.log(req.query);
    const users = await User.find(req.query);
    res.send({ success: true, users });
  } catch (error) {
    console.log(error);
    res.send({ success: false, error });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, firstName } = req.body;

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, error: "Email already taken." });
    }

    // Generate OTP
    const otp = generateOTP();

    // Create new user
    const newUser = new User({
      ...req.body,
      username: req.body.email.split("@")[0],
      otp: otp,
      otpExpires: Date.now() + 3 * 60 * 1000,
    });

    await newUser.save();

    // Send OTP via email
    await sendOTP(firstName, email, otp);

    res.send({
      success: true,
      user: newUser,
      message: "User created successfully and OTP sent to email.",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

exports.auth = async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.email }],
    });
    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Cannot find a user with that account",
        });
    }

    const match = await user.comparePassword(req.body.password);

    if (!match) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Login Credentials" });
    }

    const isVerified = user.isVerified;

    if (!isVerified) {
      return res
        .status(404)
        .json({ success: false, message: "User is not verified" });
    }

    const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: 86400,
    });

    res.send({
      success: true,
      access_token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        access_level: user.access_level,
        avatar: user.avatar || "",
      },    
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Internal Server Error", error });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, error: "OTP has expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "User verified successfully" });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if(!user){
      return res.status(404).json({ success: false, message: "Cannot find a user with that account"});
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 3 * 60 * 1000;
    
    await user.save();

    await sendOTP(user.firstName, email, otp);

    res.send({ success: true, message: "Your OTP is already sent to your Email"});

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error"});
  }
}

exports.requestPasswordReset = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Cannot find a user with that account",
        });
    }

    const token = uuidv4();

    const resetToken = "http://localhost:5173/auth/reset-password?token=" + token;
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 3 * 60 * 1000;

    await user.save();
    await sendVerificationEmail(user.firstName, email, resetToken);

    res.send({ success: true, message: "Your password request is send to your email" });


  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error"});
  }
}


exports.resetPassword = async (req, res) => {
  try {
    const { email, passwordResetToken, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Cannot find a user with that account",
      });
    }


    if (!user.passwordResetToken || user.passwordResetToken !== passwordResetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (user.passwordResetExpires && user.passwordResetExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Password reset token has expired",
      });
    }

    const isSamePassword = await user.comparePassword(newPassword);

    if (!isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "You cannot reuse your previous password. Please choose a new one.",
      });
    }

    await User.findOneAndUpdate(
      { email },
      {
        password: newPassword, 
        passwordResetToken: null, 
        passwordResetExpires: null,
      }
    );

    res.status(200).json({
      success: true,
      message: "Password has been successfully reset. You can now log in.",
    });

  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
