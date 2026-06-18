/**
 * 中间件单元测试
 * 测试 paginate、errorHandler、auth 中间件的行为
 */
const httpMocks = require('http-mocks') || undefined;

// 自制轻量 mock 辅助函数（避免额外依赖）
const createMockReq = (overrides = {}) => ({
  query: {},
  params: {},
  body: {},
  headers: {},
  header: function (name) {
    return this.headers[name.toLowerCase()];
  },
  ...overrides,
});

const createMockRes = () => {
  const res = {};
  res.statusCode = 200;
  res._status = 200;
  res._json = null;
  res._headers = {};

  res.status = function (code) {
    this._status = code;
    return this;
  };

  res.json = function (data) {
    this._json = data;
    this._headers['content-type'] = 'application/json';
    return this;
  };

  res.setHeader = function (name, value) {
    this._headers[name] = value;
  };

  return res;
};

const createMockNext = () => jest.fn();

// ============================================================
// paginate 中间件测试
// ============================================================
describe('paginate 中间件', () => {
  let paginate;

  beforeAll(() => {
    paginate = require('../middleware/paginate');
  });

  describe('默认值', () => {
    it('应使用默认的 page=1 limit=10 sort=-createdAt', () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = jest.fn();

      paginate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.pagination).toBeDefined();
      expect(req.pagination.page).toBe(1);
      expect(req.pagination.limit).toBe(10);
      expect(req.pagination.skip).toBe(0);
      expect(req.pagination.sort).toBe('-createdAt');
      expect(req.pagination.search).toBe('');
      expect(req.pagination.searchFields).toEqual([]);
    });

    it('应提供 res.paginate 方法', () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = jest.fn();

      paginate(req, res, next);

      expect(typeof res.paginate).toBe('function');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('自定义参数', () => {
    it('应正确解析自定义 page 和 limit', () => {
      const req = createMockReq({ query: { page: '3', limit: '20' } });
      const res = createMockRes();
      const next = jest.fn();

      paginate(req, res, next);

      expect(req.pagination.page).toBe(3);
      expect(req.pagination.limit).toBe(20);
      expect(req.pagination.skip).toBe(40); // (3-1) * 20
    });

    it('应将 page 下限钳制为 1', () => {
      const req = createMockReq({ query: { page: '-5', limit: '10' } });
      const res = createMockRes();
      const next = jest.fn();

      paginate(req, res, next);

      expect(req.pagination.page).toBe(1);
    });

    it('应将 limit 上限钳制为 100', () => {
      const req = createMockReq({ query: { page: '1', limit: '500' } });
      const res = createMockRes();
      const next = jest.fn();

      paginate(req, res, next);

      expect(req.pagination.limit).toBe(100);
    });

    it('应将 limit 下限钳制为 1', () => {
      const req = createMockReq({ query: { page: '1', limit: '0' } });
      const res = createMockRes();
      const next = jest.fn();

      paginate(req, res, next);

      expect(req.pagination.limit).toBe(1);
    });

    it('应正确解析 sort 参数', () => {
      const req = createMockReq({ query: { sort: 'name' } });
      const res = createMockRes();
      const next = jest.fn();

      paginate(req, res, next);

      expect(req.pagination.sort).toBe('name');
    });
  });

  describe('搜索条件构建', () => {
    it('应正确解析 search 参数', () => {
      const req = createMockReq({ query: { search: '数学' } });
      const res = createMockRes();
      const next = jest.fn();

      paginate(req, res, next);

      expect(req.pagination.search).toBe('数学');
      expect(req.pagination.searchFields).toEqual([]);
    });

    it('应正确解析 searchFields 参数', () => {
      const req = createMockReq({ query: { searchFields: 'name,code' } });
      const res = createMockRes();
      const next = jest.fn();

      paginate(req, res, next);

      expect(req.pagination.searchFields).toEqual(['name', 'code']);
    });

    it('应同时支持 search 和 searchFields', () => {
      const req = createMockReq({
        query: { search: 'CS101', searchFields: 'code,name,description' },
      });
      const res = createMockRes();
      const next = jest.fn();

      paginate(req, res, next);

      expect(req.pagination.search).toBe('CS101');
      expect(req.pagination.searchFields).toEqual(['code', 'name', 'description']);
    });
  });

  describe('res.paginate 方法', () => {
    it('应返回正确的分页响应结构', () => {
      const req = createMockReq({ query: { page: '2', limit: '10' } });
      const res = createMockRes();
      const next = jest.fn();

      paginate(req, res, next);

      const data = [{ id: 1 }, { id: 2 }];
      const total = 25;

      res.paginate(data, total);

      expect(res._json).toBeDefined();
      expect(res._json.success).toBe(true);
      expect(res._json.data).toEqual(data);
      expect(res._json.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        pages: 3,
        hasMore: true,
      });
    });

    it('hasMore 在最后一页时应为 false', () => {
      const req = createMockReq({ query: { page: '3', limit: '10' } });
      const res = createMockRes();
      const next = jest.fn();

      paginate(req, res, next);

      const data = [];
      const total = 25;

      res.paginate(data, total);

      expect(res._json.pagination.hasMore).toBe(false);
      expect(res._json.pagination.pages).toBe(3);
    });

    it('总数为 0 时 pages 应为 0', () => {
      const req = createMockReq({ query: { page: '1', limit: '10' } });
      const res = createMockRes();
      const next = jest.fn();

      paginate(req, res, next);

      res.paginate([], 0);

      expect(res._json.pagination.total).toBe(0);
      expect(res._json.pagination.pages).toBe(0);
      expect(res._json.pagination.hasMore).toBe(false);
    });
  });
});

// ============================================================
// errorHandler 中间件测试
// ============================================================
describe('errorHandler 中间件', () => {
  let errorHandler;
  const logger = require('../config/logger');

  beforeAll(() => {
    errorHandler = require('../middleware/errorHandler');
  });

  beforeEach(() => {
    jest.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('通用错误', () => {
    it('应返回 err.status 指定的状态码', () => {
      const req = createMockReq();
      const res = createMockRes();
      const err = new Error('自定义错误');
      err.status = 418;

      errorHandler(err, req, res, jest.fn());

      expect(res._status).toBe(418);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('自定义错误');
    });

    it('默认状态码应为 500', () => {
      const req = createMockReq();
      const res = createMockRes();
      const err = new Error('内部错误');

      errorHandler(err, req, res, jest.fn());

      expect(res._status).toBe(500);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('内部错误');
    });
  });

  describe('Mongoose ValidationError', () => {
    it('应返回 400 并包含验证错误信息', () => {
      const req = createMockReq();
      const res = createMockRes();
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = {
        username: { message: '请输入用户名' },
        email: { message: '请输入有效的邮箱' },
      };

      errorHandler(err, req, res, jest.fn());

      expect(res._status).toBe(400);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('数据验证失败');
      expect(res._json.errors).toEqual(['请输入用户名', '请输入有效的邮箱']);
    });
  });

  describe('Mongoose 重复键错误 (code 11000)', () => {
    it('应返回 400 并提示字段已存在', () => {
      const req = createMockReq();
      const res = createMockRes();
      const err = new Error('Duplicate key');
      err.code = 11000;
      err.keyValue = { email: 'test@test.com' };

      errorHandler(err, req, res, jest.fn());

      expect(res._status).toBe(400);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('email 已存在');
    });
  });

  describe('Mongoose CastError', () => {
    it('应返回 400 并提示无效的 ID', () => {
      const req = createMockReq();
      const res = createMockRes();
      const err = new Error('Cast to ObjectId failed');
      err.name = 'CastError';
      err.path = '_id';
      err.value = 'invalid-id';

      errorHandler(err, req, res, jest.fn());

      expect(res._status).toBe(400);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('无效的 _id: invalid-id');
    });
  });

  describe('JWT 错误', () => {
    it('应返回 401 并提示令牌无效', () => {
      const req = createMockReq();
      const res = createMockRes();
      const err = new Error('jwt malformed');
      err.name = 'JsonWebTokenError';

      errorHandler(err, req, res, jest.fn());

      expect(res._status).toBe(401);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('无效的令牌');
    });
  });
});

// ============================================================
// auth 中间件测试
// ============================================================
describe('auth 中间件', () => {
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../middleware/auth');
  const User = require('../models/User');

  let auth;
  let requireRole;

  beforeAll(() => {
    const authModule = require('../middleware/auth');
    auth = authModule.auth;
    requireRole = authModule.requireRole;
  });

  describe('auth 中间件', () => {
    it('无 token 时应返回 401', async () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = jest.fn();

      await auth(req, res, next);

      expect(res._status).toBe(401);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('请先登录');
      expect(next).not.toHaveBeenCalled();
    });

    it('无效 token 时应返回 401', async () => {
      const req = createMockReq({
        headers: { authorization: 'Bearer invalid_token_xyz' },
      });
      const res = createMockRes();
      const next = jest.fn();

      await auth(req, res, next);

      expect(res._status).toBe(401);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('登录已过期，请重新登录');
      expect(next).not.toHaveBeenCalled();
    });

    it('有效 token 但用户不存在时应返回 401', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const token = jwt.sign({ id: fakeId }, JWT_SECRET);
      const req = createMockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockRes();
      const next = jest.fn();

      await auth(req, res, next);

      expect(res._status).toBe(401);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('用户不存在');
      expect(next).not.toHaveBeenCalled();
    });

    it('有效 token 时应设置 req.user 并调用 next', async () => {
      // 需要在数据库中有一个真实用户
      const user = await User.create({
        username: 'auth_test_user',
        email: 'auth_test@test.com',
        password: 'password123',
        role: 'student',
      });

      const token = jwt.sign({ id: user._id }, JWT_SECRET);
      const req = createMockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockRes();
      const next = jest.fn();

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(user._id.toString());
      expect(req.user.email).toBe('auth_test@test.com');

      await User.deleteMany({});
    });

    it('支持从 query.token 获取 token', async () => {
      const user = await User.create({
        username: 'auth_query_test',
        email: 'auth_query@test.com',
        password: 'password123',
        role: 'student',
      });

      const token = jwt.sign({ id: user._id }, JWT_SECRET);
      const req = createMockReq({
        query: { token },
      });
      const res = createMockRes();
      const next = jest.fn();

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('auth_query@test.com');

      await User.deleteMany({});
    });
  });

  describe('requireRole 中间件', () => {
    it('req.user 不存在时应返回 401', () => {
      const middleware = requireRole('admin');
      const req = createMockReq();
      const res = createMockRes();
      const next = jest.fn();

      middleware(req, res, next);

      expect(res._status).toBe(401);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('请先登录');
      expect(next).not.toHaveBeenCalled();
    });

    it('角色不匹配时应返回 403', () => {
      const middleware = requireRole('admin');
      const req = createMockReq({ user: { role: 'student' } });
      const res = createMockRes();
      const next = jest.fn();

      middleware(req, res, next);

      expect(res._status).toBe(403);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('权限不足');
      expect(next).not.toHaveBeenCalled();
    });

    it('角色匹配时应调用 next', () => {
      const middleware = requireRole('admin', 'teacher');
      const req = createMockReq({ user: { role: 'teacher' } });
      const res = createMockRes();
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('管理员角色应通过 admin 检查', () => {
      const middleware = requireRole('admin');
      const req = createMockReq({ user: { role: 'admin' } });
      const res = createMockRes();
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});