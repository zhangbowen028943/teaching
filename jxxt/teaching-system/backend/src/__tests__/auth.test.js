/**
 * 认证 API 集成测试
 * 使用 supertest 测试注册、登录、获取当前用户等接口
 */
const supertest = require('supertest');
const User = require('../models/User');
const {
  buildApp,
  connectTestDB,
  closeTestDB,
  clearCollections,
  createTestUser,
} = require('./helpers');

let app;
let request;

beforeAll(async () => {
  await connectTestDB();
  app = buildApp();
  request = supertest(app);
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearCollections();
});

// ============================================================
// POST /api/auth/register — 注册
// ============================================================
describe('POST /api/auth/register', () => {
  describe('正常路径', () => {
    it('应成功注册新用户并返回 token 和用户信息', async () => {
      const res = await request.post('/api/auth/register').send({
        username: 'newstudent',
        email: 'newstudent@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('注册成功');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.username).toBe('newstudent');
      expect(res.body.data.user.email).toBe('newstudent@test.com');
      expect(res.body.data.user.role).toBe('student');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('默认角色应为 student', async () => {
      const res = await request.post('/api/auth/register').send({
        username: 'autostudent',
        email: 'autostudent@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('student');
    });

    it('注册后密码应经过哈希处理', async () => {
      await request.post('/api/auth/register').send({
        username: 'hashcheck',
        email: 'hashcheck@test.com',
        password: 'password123',
      });

      const user = await User.findOne({ email: 'hashcheck@test.com' }).select('+password');
      expect(user).toBeDefined();
      expect(user.password).not.toBe('password123');
      expect(user.password.startsWith('$2a$')).toBe(true);
    });
  });

  describe('错误路径', () => {
    it('重复邮箱应返回 400', async () => {
      await request.post('/api/auth/register').send({
        username: 'user1',
        email: 'duplicate@test.com',
        password: 'password123',
      });

      const res = await request.post('/api/auth/register').send({
        username: 'user2',
        email: 'duplicate@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('该邮箱已被注册');
    });

    it('缺少必填字段应返回验证错误', async () => {
      const res = await request.post('/api/auth/register').send({
        username: 'incomplete',
        // 缺少 email 和 password
      });

      // express-validator 会返回验证错误
      // 如果没有拦截，Mongoose 也会报错
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('密码过短应返回错误', async () => {
      const res = await request.post('/api/auth/register').send({
        username: 'shortpw',
        email: 'shortpw@test.com',
        password: '123',
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('无效邮箱格式应返回错误', async () => {
      const res = await request.post('/api/auth/register').send({
        username: 'bademail',
        email: 'not-an-email',
        password: 'password123',
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });
  });
});

// ============================================================
// POST /api/auth/login — 登录
// ============================================================
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // 先注册一个用户用于登录测试
    await request.post('/api/auth/register').send({
      username: 'loginuser',
      email: 'loginuser@test.com',
      password: 'correctpassword',
    });
  });

  describe('正常路径', () => {
    it('应使用正确密码成功登录', async () => {
      const res = await request.post('/api/auth/login').send({
        email: 'loginuser@test.com',
        password: 'correctpassword',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('登录成功');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('loginuser@test.com');
      expect(res.body.data.user.username).toBe('loginuser');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('返回的 token 应可用于后续请求', async () => {
      const loginRes = await request.post('/api/auth/login').send({
        email: 'loginuser@test.com',
        password: 'correctpassword',
      });

      const token = loginRes.body.data.token;

      const meRes = await request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.email).toBe('loginuser@test.com');
    });
  });

  describe('错误路径', () => {
    it('错误密码应返回 401', async () => {
      const res = await request.post('/api/auth/login').send({
        email: 'loginuser@test.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('邮箱或密码错误');
    });

    it('不存在的用户应返回 401', async () => {
      const res = await request.post('/api/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('邮箱或密码错误');
    });

    it('缺少邮箱应返回错误', async () => {
      const res = await request.post('/api/auth/login').send({
        password: 'password123',
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('缺少密码应返回错误', async () => {
      const res = await request.post('/api/auth/login').send({
        email: 'loginuser@test.com',
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });
  });
});

// ============================================================
// GET /api/auth/me — 获取当前用户
// ============================================================
describe('GET /api/auth/me', () => {
  describe('正常路径', () => {
    it('使用有效 token 应返回用户信息', async () => {
      const { token } = await createTestUser(app, 'student');

      const res = await request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBeDefined();
      expect(res.body.data.password).toBeUndefined();
    });
  });

  describe('错误路径', () => {
    it('无 token 应返回 401', async () => {
      const res = await request.get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('请先登录');
    });

    it('无效 token 应返回 401', async () => {
      const res = await request
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_here');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('已过期 token 应返回 401', async () => {
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware/auth');
      const expiredToken = jwt.sign({ id: '507f1f77bcf86cd799439011' }, JWT_SECRET, {
        expiresIn: '0s',
      });

      const res = await request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('token 对应用户已删除应返回 401', async () => {
      const user = await User.create({
        username: 'tobedeleted',
        email: 'tobedeleted@test.com',
        password: 'password123',
        role: 'student',
      });
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware/auth');
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

      await User.findByIdAndDelete(user._id);

      const res = await request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('用户不存在');
    });
  });
});