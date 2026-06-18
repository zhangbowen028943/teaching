const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: messages,
    });
  }

  // Mongoose 重复键
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} 已存在`,
    });
  }

  // Mongoose 非法 ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `无效的 ${err.path}: ${err.value}`,
    });
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '无效的令牌',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;