import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

const setTokenCookie = (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists." });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpire = Date.now() + 10 * 60 * 1000; // 10 min expiry

  const user = await User.create({
    name,
    email,
    password,
    role,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationTokenExpire,
  });

  const verifyURL = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  const message = `
    <h2>Welcome, ${user.name}</h2>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verifyURL}">${verifyURL}</a>
    <p>This link will expire in 10 minutes.</p>
  `;

  await sendEmail(user.email, "Verify Your Email", message);

  return res.status(201).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    success: true,
    message: "User registered. Verification email sent.",
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }
  // find user by email
  const user = await User.findOne({ email });
  // if user not found or password does not match
  if (!user || !(await user.matchPassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }
  // Check if user is active
  if (!user.isActive) {
    return res
      .status(404)
      .json({
        success: false,
        message:
          "Your Account is deactivated. Please contact Customer Support ",
      });
  }
  // check if email is verified
  if (!user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Email not verified",
      allowResend: true, // you can send this to show "Resend" button
    });
  }
  const token = user.getSignedJwtToken();
  setTokenCookie(res, token);
  console.log(`User logged in: ${user.email}`);
  return res.json({
    success: true,
    message: "Login successful",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
    },
    token, // send token in response
  });
};

export const logoutUser = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Invalid or expired verification token",
      });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Email verified successfully. You can now login.",
  });
};

export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (user.isEmailVerified) {
    return res
      .status(400)
      .json({ success: false, message: "Email is already verified" });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  const verifyURL = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  const message = `
    <h2>Hello, ${user.name}</h2>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verifyURL}">${verifyURL}</a>
    <p>This link will expire in 10 minutes.</p>
  `;

  await sendEmail(user.email, "Resend Email Verification", message);

  return res.status(200).json({
    success: true,
    message: "Verification email resent",
  });
};

export const contactFormSubmission = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    console.log("contactEmail", process.env.CONTACT_EMAIL);
    await sendEmail(
      process.env.CONTACT_EMAIL,
      `Contact Form: ${subject}`,
      `<p>From: <strong>${name}</strong> (${email})</p><p>${message}</p>`
    );

    return res
      .status(200)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending contact form email:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send message." });
  }
};

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
  
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
  
    await user.save();
  
    const message = `
      <h2>Hello, ${user.name}</h2>
      <p>Your OTP for password reset is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
    `;
  
    await sendEmail(user.email, "Password Reset OTP", message);
  
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again later.",
    });
    
  }
};


export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }
  
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });
  
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }
  
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again later.",
    });
    
  }
};


export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
  
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });
  
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
  
    await user.save();
    console.log("password:",user.password);
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again later.",
    });
  }
};
