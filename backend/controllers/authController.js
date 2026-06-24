import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1h',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter all fields',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'A user with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid user data',
      });
    }
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error during registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error during login',
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private (Protected by JWT middleware)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error retrieving profile',
    });
  }
};

// @desc    Forgot password - Request reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your email address',
      });
    }

    const user = await User.findOne({ email });

    // For security, if the user doesn't exist, we send a generic success response
    // to prevent email harvesting. However, in developer mode console, we'll log it.
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, we have sent a reset password link to it.',
      });
    }

    // Get reset token (this also hashes it and sets expiry internally)
    const resetToken = user.getResetPasswordToken();

    // Save user document (bypass validations for this update)
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email message body
    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl} \n\n If you did not request this, please ignore this email and your password will remain unchanged.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset for your account. Please click the button below to reset your password. This link is valid for 10 minutes only.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste the link below into your browser:</p>
        <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af;">If you did not request this, please ignore this email and your password will remain secure.</p>
      </div>
    `;

    try {
      const emailResult = await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message,
        html,
      });

      res.status(200).json({
        success: true,
        message: 'If your email is registered, we have sent a reset password link to it.',
        // In dev mode, we return the reset url to make manual API testing/React integration super simple
        ...(emailResult.devMode && { devToken: resetToken, devResetUrl: resetUrl })
      });
    } catch (err) {
      console.error('Mail Sending Error:', err);
      // Clean up fields if email fail
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        error: 'Email could not be sent',
      });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error during password reset request',
    });
  }
};

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a new password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    // Find user with matching token and token expiration greater than now
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired password reset token',
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
      token: generateToken(user._id), // Auto-login user
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error during password reset',
    });
  }
};
