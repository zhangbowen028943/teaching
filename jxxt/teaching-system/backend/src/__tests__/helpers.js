/**
 * 测试辅助函数模块
 * 提供测试环境搭建、应用构建、测试用户创建、数据清理等功能
 */
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const paginate = require('../middleware/paginate');
const errorHandler = require('../middleware/errorHandler');
const { JWT_SECRET } = require('../middleware/auth');
const User = require('../models/User');

// 路由导入
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const courseRoutes = require('../routes/courseRoutes');

// 测试数据库 URI
const TEST_DB_URI = 'mongodb://localhost:27017/teaching-system-test';

/**
 * 构建测试用 Express 应用
 * 不启动服务器监听，不挂载速率限制中间件，方便测试
 * @returns {express.Application}
 */
const buildApp = () => {
  const app = express();

  // 分页中间件
  app.use(paginate);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 健康检查
  app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
  });

  // 路由挂载
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/courses', courseRoutes);

  // 404 处理
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: '请求的资源不存在',
    });
  });

  // 统一错误处理
  app.use(errorHandler);

  return app;
};

/**
 * 连接到测试数据库
 */
const connectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(TEST_DB_URI);
};

/**
 * 关闭测试数据库连接（先清空数据再断开）
 */
const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
};

/**
 * 清理所有集合中的数据（不关闭连接）
 */
const clearCollections = async () => {
  if (mongoose.connection.readyState === 0) return;
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * 创建测试用户并返回 token
 * - student 角色：通过 API 注册接口创建
 * - admin / teacher 角色：直接写入数据库并生成 token
 *
 * @param {express.Application} app - Express 应用实例
 * @param {string} role - 用户角色（admin | teacher | student）
 * @param {object} overrides - 覆盖默认用户数据的字段
 * @returns {Promise<{token: string, user: object}>}
 */
const createTestUser = async (app, role = 'student', overrides = {}) => {
  const timestamp = Date.now();
  const userData = {
    username: `test_${role}_${timestamp}`,
    email: `test_${role}_${timestamp}@test.com`,
    password: 'password123',
    ...overrides,
  };

  if (role === 'student') {
    // 学生通过 API 注册
    const supertest = require('supertest');
    const res = await supertest(app)
      .post('/api/auth/register')
      .send({
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });

    if (!res.body.success) {
      throw new Error(
        `Failed to create test user: ${res.body.message || JSON.stringify(res.body)}`
      );
    }

    return {
      token: res.body.data.token,
      user: res.body.data.user,
    };
  }

  // admin / teacher 直接写入数据库
  const user = await User.create({
    username: userData.username,
    email: userData.email,
    password: userData.password,
    role: role,
  });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

  return {
    token,
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = {
  buildApp,
  connectTestDB,
  closeTestDB,
  clearCollections,
  createTestUser,
  TEST_DB_URI,
};