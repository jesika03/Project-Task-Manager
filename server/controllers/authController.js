/**
 * Authentication Controller
 * Handles user registration, login, profile check, and demo seeding
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore, generateId, seedInitialData } from '../utils/mockStore.js';
import { logActivity } from './activityController.js';
import { JWT_SECRET } from '../config/jwt.js';

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your full name.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your email address.' });
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email format.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const validRoles = ['Admin', 'Project Manager', 'Team Member'];
    const assignedRole = validRoles.includes(role) ? role : 'Team Member';

    // Check if user already exists
    const userExists = dbStore.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: 'usr_' + generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
      department: department?.trim() || 'General',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.users.push(newUser);

    // Log Activity
    logActivity({
      userId: newUser._id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: newUser._id,
      details: `New ${newUser.role} registered: ${newUser.name} (${newUser.email})`,
    });

    const token = generateToken(newUser._id);
    const { password: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = dbStore.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user._id);
    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

// @desc    Get demo quick accounts
// @route   GET /api/auth/demo-accounts
// @access  Public
export const getDemoAccounts = (req, res) => {
  const accounts = [
    { role: 'Admin', email: 'admin@college.edu', password: 'admin123', name: 'Prof. S. Sharma' },
    { role: 'Project Manager', email: 'pm.rahul@college.edu', password: 'pm12345', name: 'Rahul Verma' },
    { role: 'Team Member', email: 'priya.dev@college.edu', password: 'dev12345', name: 'Priya Sundaram' },
    { role: 'QA Tester', email: 'arjun.qa@college.edu', password: 'qa12345', name: 'Arjun Nair' },
  ];
  return res.json({ success: true, accounts });
};

// @desc    Reset and re-seed store
// @route   POST /api/auth/reset-demo
// @access  Public
export const resetDemoData = async (req, res) => {
  dbStore.users = [];
  dbStore.projects = [];
  dbStore.projectMembers = [];
  dbStore.tasks = [];
  dbStore.comments = [];
  dbStore.activities = [];
  await seedInitialData();
  return res.json({ success: true, message: 'Database reset and re-seeded with demo records.' });
};
