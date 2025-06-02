import User from "../models/User.js";

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

  const user = await User.create({
    name,
    email,
    password, // will be hashed by pre-save hook
    role, // optional, defaults to 'user'
  });

  const token = user.getSignedJwtToken();
  setTokenCookie(res, token);
  console.log(`User registered: ${user.email}`);
  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token, // send token in response
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
      .json({ success: false, message: "Your Account is deactivated. Please contact Customer Support " });
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
