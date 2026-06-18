import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IUser, JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token =
      req.header('Authorization')?.replace('Bearer ', '') || (req.query.token as string);

    if (!token) {
      res.status(401).json({
        success: false,
        message: '请先登录',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = (await User.findById(decoded.id).select('-password')) as IUser | null;

    if (!user) {
      res.status(401).json({
        success: false,
        message: '用户不存在',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '登录已过期，请重新登录',
    });
  }
};

const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '请先登录',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: '权限不足',
      });
      return;
    }

    next();
  };
};

export { auth, requireRole, JWT_SECRET };