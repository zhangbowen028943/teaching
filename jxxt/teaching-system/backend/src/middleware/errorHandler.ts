import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(err.stack);

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: messages,
    });
    return;
  }

  // Mongoose 重复键
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    res.status(400).json({
      success: false,
      message: `${field} 已存在`,
    });
    return;
  }

  // Mongoose 非法 ObjectId
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: `无效的 ${err.path}: ${err.value}`,
    });
    return;
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: '无效的令牌',
    });
    return;
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;