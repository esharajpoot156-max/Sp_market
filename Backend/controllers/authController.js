import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    // Generate verification token
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your Sp.market account",
        html: `
          <h2>Welcome to Sp.market, ${user.name}!</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verifyUrl}">Verify Email</a>
          <p>This link expires in 24 hours.</p>
        `,
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError.message);
      // user still created, verification can be resent later
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Your account has been suspended" });
    }
    if (!user.isVerified) {
  return res.status(403).json({
    message: "Please verify your email before logging in",
    needsVerification: true,
  });}
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: "If that email is registered, a reset link has been sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your Sp.market password",
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
          <a href="${resetUrl}">Reset Password</a>
        `,
      });
    } catch (emailError) {
      console.error("Reset email send failed:", emailError.message);
    }

    res.status(200).json({ message: "If that email is registered, a reset link has been sent" });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your Sp.market account",
      html: `
        <h2>Verify your email</h2>
        <a href="${verifyUrl}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};