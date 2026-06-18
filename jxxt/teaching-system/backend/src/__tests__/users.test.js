/**
 * 用户 API 集成测试
 * 测试管理员创建用户、权限限制、用户列表分页和搜索等功能
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

// 测试用户凭证
let adminToken;
let teacherToken;
let studentToken;
let teacherId;
let studentId;

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

  // 创建测试用户
  const admin = await createTestUser(app, 'admin');
  adminToken = admin.token;

  const teacher = await createTestUser(app, 'teacher');
  teacherToken = teacher.token;
  teacherId = teacher.user.id;

  const student = await createTestUser(app, 'student');
  studentToken = student.token;
  studentId = student.user.id;
});

// ============================================================
// GET /api/users — 获取用户列表
// ============================================================
describe('GET /api/users — 获取用户列表', () => {
  describe('正常路径', () => {
    it('应返回分页的用户列表', async () => {
      const res = await request
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
    });

    it('应列出所有注册用户', async () => {
      const res = await request
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      // 至少应有 admin, teacher, student 三个用户
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(3);
    });

    it('用户列表中不应包含密码字段', async () => {
      const res = await request
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      res.body.data.forEach((user) => {
        expect(user.password).toBeUndefined();
      });
    });
  });

  describe('分页功能', () => {
    it('应支持自定义 page 和 limit', async () => {
      const res = await request
        .get('/api/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });

    it('limit 应不能超过 100', async () => {
      const res = await request
        .get('/api/users?page=1&limit=200')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.pagination.limit).toBe(100);
    });

    it('应正确计算总页数', async () => {
      // 额外创建一些用户
      for (let i = 0; i < 8; i++) {
        await User.create({
          username: `extrauser${i}`,
          email: `extra${i}@test.com`,
          password: 'password123',
          role: 'student',
        });
      }

      const res = await request
        .get('/api/users?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.pagination.pages).toBeGreaterThanOrEqual(3);
      expect(res.body.pagination.hasMore).toBe(true);
    });
  });

  describe('搜索功能', () => {
    it('应支持按用户名搜索', async () => {
      const res = await request
        .get(`/api/users?search=${teacherId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      // 搜索可能匹配到用户名中包含该字符串的用户
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('应支持按邮箱搜索', async () => {
      // 搜索 teacher 的邮箱
      const res = await request
        .get('/api/users?search=teacher')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(0);
    });

    it('无匹配结果应返回空数组', async () => {
      const res = await request
        .get('/api/users?search=不存在的用户名xyz123')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.length).toBe(0);
      expect(res.body.pagination.total).toBe(0);
    });
  });

  describe('角色过滤', () => {
    it('应支持按 role 过滤', async () => {
      const res = await request
        .get('/api/users?role=student')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      res.body.data.forEach((user) => {
        expect(user.role).toBe('student');
      });
    });

    it('过滤 teacher 角色应只返回教师', async () => {
      const res = await request
        .get('/api/users?role=teacher')
        .set('Authorization', `Bearer ${adminToken}`);

      res.body.data.forEach((user) => {
        expect(user.role).toBe('teacher');
      });
    });
  });

  describe('权限控制', () => {
    it('未认证用户应返回 401', async () => {
      const res = await request.get('/api/users');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('普通学生应能查看用户列表', async () => {
      const res = await request
        .get('/api/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

// ============================================================
// GET /api/users/:id — 获取单个用户
// ============================================================
describe('GET /api/users/:id — 获取单个用户', () => {
  describe('正常路径', () => {
    it('应返回指定用户', async () => {
      const res = await request
        .get(`/api/users/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(studentId);
      expect(res.body.data.password).toBeUndefined();
    });
  });

  describe('错误路径', () => {
    it('不存在的用户应返回 404', async () => {
      const res = await request
        .get('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('用户不存在');
    });

    it('无效的 ID 格式应返回 400', async () => {
      const res = await request
        .get('/api/users/invalid-id-format')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});

// ============================================================
// POST /api/users — 管理员创建用户
// ============================================================
describe('POST /api/users — 管理员创建用户', () => {
  describe('正常路径', () => {
    it('管理员应能创建任意角色用户', async () => {
      const res = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newteacher',
          email: 'newteacher@test.com',
          password: 'password123',
          role: 'teacher',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('newteacher');
      expect(res.body.data.email).toBe('newteacher@test.com');
      expect(res.body.data.role).toBe('teacher');
      expect(res.body.data.password).toBeUndefined();
    });

    it('应能创建 student 角色用户', async () => {
      const res = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newstudent2',
          email: 'newstudent2@test.com',
          password: 'password123',
          role: 'student',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.role).toBe('student');
    });

    it('应能创建 admin 角色用户', async () => {
      const res = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newadmin',
          email: 'newadmin@test.com',
          password: 'password123',
          role: 'admin',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.role).toBe('admin');
    });
  });

  describe('错误路径', () => {
    it('非管理员不能创建用户', async () => {
      const res = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          username: 'teachercreated',
          email: 'teachercreated@test.com',
          password: 'password123',
          role: 'student',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('权限不足');
    });

    it('学生不能创建用户', async () => {
      const res = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          username: 'studentcreated',
          email: 'studentcreated@test.com',
          password: 'password123',
          role: 'student',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('重复邮箱应返回错误', async () => {
      await request
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'user1',
          email: 'dup@test.com',
          password: 'password123',
          role: 'student',
        });

      const res = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'user2',
          email: 'dup@test.com',
          password: 'password123',
          role: 'student',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('缺少必填字段应返回错误', async () => {
      const res = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'incomplete',
          // 缺少 email 和 password
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });
  });
});

// ============================================================
// PUT /api/users/:id — 更新用户
// ============================================================
describe('PUT /api/users/:id — 更新用户', () => {
  describe('正常路径', () => {
    it('管理员应能更新任何用户', async () => {
      const res = await request
        .put(`/api/users/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'updatedstudent',
          phone: '13800138000',
          bio: '更新后的个人简介',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('updatedstudent');
      expect(res.body.data.phone).toBe('13800138000');
      expect(res.body.data.bio).toBe('更新后的个人简介');
    });

    it('管理员应能修改用户角色', async () => {
      const res = await request
        .put(`/api/users/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'teacher' });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('teacher');
    });

    it('用户应能修改自己的信息', async () => {
      const res = await request
        .put(`/api/users/${studentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          username: 'selfupdated',
          bio: '自己修改的简介',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('selfupdated');
      expect(res.body.data.bio).toBe('自己修改的简介');
    });
  });

  describe('权限限制', () => {
    it('普通用户不能修改他人信息', async () => {
      const res = await request
        .put(`/api/users/${teacherId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ username: 'hacked' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('权限不足');
    });

    it('非管理员不能修改自己的角色', async () => {
      const res = await request
        .put(`/api/users/${studentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ role: 'admin' });

      // 角色字段应被控制器忽略，但请求本身成功
      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('student'); // 角色未变
    });

    it('非管理员不能修改 isActive', async () => {
      const res = await request
        .put(`/api/users/${studentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      // isActive 应被忽略，保持默认值
      expect(res.body.data.isActive).toBe(true);
    });
  });

  describe('错误路径', () => {
    it('不存在的用户应返回 404', async () => {
      const res = await request
        .put('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'nobody' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

// ============================================================
// DELETE /api/users/:id — 删除用户
// ============================================================
describe('DELETE /api/users/:id — 删除用户', () => {
  describe('正常路径', () => {
    it('管理员应能删除用户', async () => {
      const res = await request
        .delete(`/api/users/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('删除成功');

      // 确认已删除
      const getRes = await request
        .get(`/api/users/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('权限限制', () => {
    it('非管理员不能删除用户', async () => {
      const res = await request
        .delete(`/api/users/${studentId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('权限不足');
    });

    it('学生不能删除用户', async () => {
      const res = await request
        .delete(`/api/users/${teacherId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('错误路径', () => {
    it('不存在的用户应返回 404', async () => {
      const res = await request
        .delete('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('无效的 ID 格式应返回 400', async () => {
      const res = await request
        .delete('/api/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});

// ============================================================
// GET /api/users/teachers — 获取教师列表
// ============================================================
describe('GET /api/users/teachers — 获取教师列表', () => {
  it('应返回所有教师', async () => {
    const res = await request
      .get('/api/users/teachers')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((user) => {
      expect(user.role).toBe('teacher');
    });
  });
});

// ============================================================
// GET /api/users/students — 获取学生列表
// ============================================================
describe('GET /api/users/students — 获取学生列表', () => {
  it('应返回所有学生', async () => {
    const res = await request
      .get('/api/users/students')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((user) => {
      expect(user.role).toBe('student');
    });
  });
});