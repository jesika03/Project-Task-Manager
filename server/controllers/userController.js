/**
 * User Controller (CRUD for Users)
 * Administrative & directory operations
 */

import bcrypt from 'bcryptjs';
import { dbStore, generateId } from '../utils/mockStore.js';
import { logActivity } from './activityController.js';

// @desc    Get all users with search, role filter, pagination, and sorting
// @route   GET /api/users
// @access  Private (All authenticated users can see directory, Admin has full manage)
export const getUsers = (req, res) => {
  let list = dbStore.users.map(({ password, ...u }) => u);

  const { search, role, department, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q))
    );
  }

  if (role && role !== 'All') {
    list = list.filter((u) => u.role === role);
  }

  if (department && department !== 'All') {
    list = list.filter((u) => u.department === department);
  }

  // Sorting
  list.sort((a, b) => {
    let fieldA = a[sortBy];
    let fieldB = b[sortBy];
    if (typeof fieldA === 'string') {
      return sortOrder === 'asc'
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    }
    return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
  });

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const total = list.length;
  const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: paginated,
  });
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = (req, res) => {
  const user = dbStore.users.find((u) => u._id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const { password, ...safeUser } = user;
  return res.json({ success: true, data: safeUser });
};

// @desc    Create user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Express Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'User name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'User email is required.' });
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address syntax.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existing = dbStore.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existing) {
      return res.status(400).json({ success: false, message: 'User email already exists in system.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: 'usr_' + generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role || 'Team Member',
      department: department?.trim() || 'Engineering',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.users.push(newUser);

    logActivity({
      userId: req.user._id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: newUser._id,
      details: `Admin ${req.user.name} created user ${newUser.name} with role ${newUser.role}`,
    });

    const { password: _, ...safeUser } = newUser;
    return res.status(201).json({ success: true, message: 'User created successfully.', data: safeUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or Self)
export const updateUser = async (req, res, next) => {
  try {
    const userIndex = dbStore.users.findIndex((u) => u._id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Role check: non-admin can only update their own profile and cannot elevate role
    if (req.user.role !== 'Admin' && req.user._id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this user.' });
    }

    const { name, role, department, password } = req.body;
    const existingUser = dbStore.users[userIndex];

    if (name) existingUser.name = name.trim();
    if (department) existingUser.department = department.trim();

    // Only Admin can change user role
    if (role && req.user.role === 'Admin') {
      existingUser.role = role;
    }

    // Password change if provided
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash(password, salt);
    }

    existingUser.updatedAt = new Date();
    dbStore.users[userIndex] = existingUser;

    const { password: _, ...safeUser } = existingUser;
    return res.json({ success: true, message: 'User updated successfully.', data: safeUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = (req, res) => {
  const userIndex = dbStore.users.findIndex((u) => u._id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Prevent deleting self
  if (req.user._id === req.params.id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own active account.' });
  }

  const deletedUser = dbStore.users.splice(userIndex, 1)[0];

  logActivity({
    userId: req.user._id,
    action: 'USER_REGISTERED',
    entityType: 'User',
    entityId: deletedUser._id,
    details: `Admin ${req.user.name} removed user ${deletedUser.name} (${deletedUser.email})`,
  });

  return res.json({ success: true, message: 'User removed from system.' });
};
