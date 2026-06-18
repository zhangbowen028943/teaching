const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error('该邮箱已被注册');
      error.status = 400;
      throw error;
    }

    // 仅管理员可创建教师/管理员账号
    let userRole = 'student';
    if (req.user?.role === 'admin' && role) {
      userRole = role;
    }

    const user = await User.create({
      username,
      email,
      password,
      role: userRole,
    });

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token: generateToken(user._id),
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error('邮箱或密码错误');
      error.status = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('邮箱或密码错误');
      error.status = 401;
      throw error;
    }

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token: generateToken(user._id),
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};
