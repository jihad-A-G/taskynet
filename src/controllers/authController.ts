import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import type { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret: Secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production';
const expiresIn: string | number = process.env.JWT_EXPIRES_IN || '7d';
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with password included
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      jwtSecret as any,
      { expiresIn: expiresIn as any }
    );
    

    // Return user data without password
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      roleId: user.roleId,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error: any) {
    return res.status(500).json({ error: 'Login failed' });
  }
};
