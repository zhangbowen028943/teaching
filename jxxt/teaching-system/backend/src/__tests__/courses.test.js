/**
 * 课程 API 集成测试
 * 测试 CRUD 操作、分页、搜索、选课/退课等功能
 */
const supertest = require('supertest');
const Course = require('../models/Course');
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
// 辅助函数：创建测试课程
// ============================================================
const createTestCourse = async (token, overrides = {}) => {
  const courseData = {
    name: '测试课程',
    code: `CS${Date.now()}`,
    description: '这是一个测试课程',
    teacher: teacherId,
    credits: 3,
    ...overrides,
  };

  const res = await request
    .post('/api/courses')
    .set('Authorization', `Bearer ${token}`)
    .send(courseData);

  return res;
};

// ============================================================
// POST /api/courses — 创建课程
// ============================================================
describe('POST /api/courses — 创建课程', () => {
  describe('正常路径', () => {
    it('管理员应能创建课程', async () => {
      const res = await createTestCourse(adminToken);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('测试课程');
      expect(res.body.data.teacher).toBeDefined();
    });

    it('教师应能创建课程（teacher 自动设为自身）', async () => {
      const res = await request
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: '教师自建课程',
          code: `TC${Date.now()}`,
          description: '教师自动成为授课教师',
          credits: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.teacher._id.toString()).toBe(teacherId);
    });

    it('应支持设置 schedule 和 credits', async () => {
      const res = await createTestCourse(adminToken, {
        name: '含课表课程',
        code: `SCH${Date.now()}`,
        credits: 4,
        schedule: {
          dayOfWeek: 3,
          startTime: '10:00',
          endTime: '11:40',
          classroom: '教学楼301',
        },
      });

      expect(res.status).toBe(201);
      expect(res.body.data.credits).toBe(4);
      expect(res.body.data.schedule.dayOfWeek).toBe(3);
      expect(res.body.data.schedule.classroom).toBe('教学楼301');
    });
  });

  describe('错误路径', () => {
    it('学生不能创建课程', async () => {
      const res = await createTestCourse(studentToken);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('权限不足');
    });

    it('未认证不能创建课程', async () => {
      const res = await request.post('/api/courses').send({
        name: '未认证课程',
        code: 'NA101',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('重复课程代码应返回错误', async () => {
      await createTestCourse(adminToken, { code: 'DUP101' });

      const res = await createTestCourse(adminToken, { code: 'DUP101' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('缺少必填字段应返回错误', async () => {
      const res = await request
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // 缺少 name 和 code
          description: '不完整的课程',
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });
  });
});

// ============================================================
// GET /api/courses — 获取课程列表
// ============================================================
describe('GET /api/courses — 获取课程列表', () => {
  describe('正常路径', () => {
    it('应返回分页的课程列表', async () => {
      const res = await request
        .get('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
    });

    it('管理员应能看到所有课程', async () => {
      await createTestCourse(adminToken, { name: '课程A', code: 'CA001' });
      await createTestCourse(adminToken, { name: '课程B', code: 'CB002' });

      const res = await request
        .get('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it('教师应只能看到自己的课程', async () => {
      // 管理员创建一个教师课程
      await createTestCourse(adminToken, { name: '教师课程', code: 'TC001' });
      // 教师自己创建课程
      await createTestCourse(teacherToken, { name: '我的课程', code: 'MY001' });

      const res = await request
        .get('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`);

      // 教师只能看到自己的课程（teacherId 匹配的）
      const allMyCourses = res.body.data.filter(
        (c) => c.teacher._id.toString() === teacherId
      );
      expect(allMyCourses.length).toBe(res.body.data.length);
    });
  });

  describe('分页功能', () => {
    it('应支持自定义分页参数', async () => {
      const res = await request
        .get('/api/courses?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.page).toBe(1);
    });

    it('大量数据时应正确分页', async () => {
      // 创建 12 门课程
      for (let i = 0; i < 12; i++) {
        await createTestCourse(adminToken, {
          name: `课程${i}`,
          code: `CS${i}${Date.now()}`,
        });
      }

      const res = await request
        .get('/api/courses?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.length).toBe(5);
      expect(res.body.pagination.pages).toBe(3);
      expect(res.body.pagination.hasMore).toBe(true);
    });
  });

  describe('搜索功能', () => {
    it('应支持按名称搜索', async () => {
      await createTestCourse(adminToken, { name: '高等数学', code: 'MATH101' });
      await createTestCourse(adminToken, { name: '大学物理', code: 'PHY101' });

      const res = await request
        .get('/api/courses?search=数学')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('高等数学');
    });

    it('应支持按课程代码搜索', async () => {
      await createTestCourse(adminToken, { name: '课程1', code: 'CS101' });
      await createTestCourse(adminToken, { name: '课程2', code: 'CS202' });

      const res = await request
        .get('/api/courses?search=CS101')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].code).toBe('CS101');
    });

    it('无匹配结果应返回空数组', async () => {
      await createTestCourse(adminToken, { name: '课程A', code: 'CA001' });

      const res = await request
        .get('/api/courses?search=不存在的课程名称')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.length).toBe(0);
      expect(res.body.pagination.total).toBe(0);
    });
  });
});

// ============================================================
// GET /api/courses/:id — 获取单个课程
// ============================================================
describe('GET /api/courses/:id — 获取单个课程', () => {
  describe('正常路径', () => {
    it('应返回指定课程', async () => {
      const createRes = await createTestCourse(adminToken, {
        name: '指定课程',
        code: 'SPC001',
      });
      const courseId = createRes.body.data._id;

      const res = await request
        .get(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('指定课程');
      expect(res.body.data.code).toBe('SPC001');
    });
  });

  describe('错误路径', () => {
    it('不存在的课程应返回 404', async () => {
      const res = await request
        .get('/api/courses/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('课程不存在');
    });

    it('无效的 ID 格式应返回 400', async () => {
      const res = await request
        .get('/api/courses/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});

// ============================================================
// PUT /api/courses/:id — 更新课程
// ============================================================
describe('PUT /api/courses/:id — 更新课程', () => {
  describe('正常路径', () => {
    it('管理员应能更新任何课程', async () => {
      const createRes = await createTestCourse(adminToken, {
        name: '待更新课程',
        code: 'UPD001',
      });
      const courseId = createRes.body.data._id;

      const res = await request
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '已更新课程名称', credits: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('已更新课程名称');
      expect(res.body.data.credits).toBe(5);
    });

    it('教师应能更新自己的课程', async () => {
      const createRes = await createTestCourse(teacherToken, {
        name: '我的课程',
        code: 'MYUPD01',
      });
      const courseId = createRes.body.data._id;

      const res = await request
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ description: '更新后的描述' });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe('更新后的描述');
    });
  });

  describe('错误路径', () => {
    it('教师不能更新其他教师的课程', async () => {
      const createRes = await createTestCourse(adminToken, {
        name: '其他教师课程',
        code: 'OTH001',
      });
      const courseId = createRes.body.data._id;

      const res = await request
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ name: '尝试篡改' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('权限不足');
    });

    it('学生不能更新课程', async () => {
      const createRes = await createTestCourse(adminToken, {
        name: '学生不可改',
        code: 'STU001',
      });
      const courseId = createRes.body.data._id;

      const res = await request
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ name: '学生尝试修改' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('不存在的课程应返回 404', async () => {
      const res = await request
        .put('/api/courses/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '不存在' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

// ============================================================
// DELETE /api/courses/:id — 删除课程
// ============================================================
describe('DELETE /api/courses/:id — 删除课程', () => {
  describe('正常路径', () => {
    it('管理员应能删除课程', async () => {
      const createRes = await createTestCourse(adminToken, {
        name: '待删除课程',
        code: 'DEL001',
      });
      const courseId = createRes.body.data._id;

      const res = await request
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('删除成功');

      // 确认已删除
      const getRes = await request
        .get(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(getRes.status).toBe(404);
    });

    it('教师应能删除自己的课程', async () => {
      const createRes = await createTestCourse(teacherToken, {
        name: '我的课程',
        code: 'MYDEL01',
      });
      const courseId = createRes.body.data._id;

      const res = await request
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('错误路径', () => {
    it('教师不能删除其他教师的课程', async () => {
      const createRes = await createTestCourse(adminToken, {
        name: '不可删除',
        code: 'NDEL01',
      });
      const courseId = createRes.body.data._id;

      const res = await request
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('学生不能删除课程', async () => {
      const createRes = await createTestCourse(adminToken, {
        name: '学生不可删',
        code: 'STUDEL01',
      });
      const courseId = createRes.body.data._id;

      const res = await request
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('不存在的课程应返回 404', async () => {
      const res = await request
        .delete('/api/courses/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

// ============================================================
// POST /api/courses/:id/join — 学生选课
// ============================================================
describe('POST /api/courses/:id/join — 学生选课', () => {
  let courseId;

  beforeEach(async () => {
    const createRes = await createTestCourse(adminToken, {
      name: '可选课程',
      code: `JOIN${Date.now()}`,
    });
    courseId = createRes.body.data._id;
  });

  describe('正常路径', () => {
    it('学生应能成功选课', async () => {
      const res = await request
        .post(`/api/courses/${courseId}/join`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.students).toBeDefined();
      expect(res.body.data.students.some((s) => s._id.toString() === studentId)).toBe(true);
    });
  });

  describe('错误路径', () => {
    it('重复选课应返回错误', async () => {
      await request
        .post(`/api/courses/${courseId}/join`)
        .set('Authorization', `Bearer ${studentToken}`);

      const res = await request
        .post(`/api/courses/${courseId}/join`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('已选修该课程');
    });

    it('非学生角色不能选课', async () => {
      const res = await request
        .post(`/api/courses/${courseId}/join`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('不存在的课程应返回 404', async () => {
      const res = await request
        .post('/api/courses/507f1f77bcf86cd799439011/join')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

// ============================================================
// POST /api/courses/:id/leave — 学生退课
// ============================================================
describe('POST /api/courses/:id/leave — 学生退课', () => {
  let courseId;

  beforeEach(async () => {
    const createRes = await createTestCourse(adminToken, {
      name: '可退课程',
      code: `LEAVE${Date.now()}`,
    });
    courseId = createRes.body.data._id;

    // 先选课
    await request
      .post(`/api/courses/${courseId}/join`)
      .set('Authorization', `Bearer ${studentToken}`);
  });

  describe('正常路径', () => {
    it('学生应能成功退课', async () => {
      const res = await request
        .post(`/api/courses/${courseId}/leave`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.students.some((s) => s._id.toString() === studentId)).toBe(false);
    });
  });

  describe('错误路径', () => {
    it('不存在的课程应返回 404', async () => {
      const res = await request
        .post('/api/courses/507f1f77bcf86cd799439011/leave')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('非学生角色不能退课', async () => {
      const res = await request
        .post(`/api/courses/${courseId}/leave`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});