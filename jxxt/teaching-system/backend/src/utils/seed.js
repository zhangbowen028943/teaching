const User = require('../models/User');
const Course = require('../models/Course');

const seedData = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (adminExists) return;

    // 创建默认账号
    const admin = await User.create({
      username: '管理员',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    const teacher = await User.create({
      username: '张老师',
      email: 'teacher@example.com',
      password: 'teacher123',
      role: 'teacher',
    });

    const student = await User.create({
      username: '李同学',
      email: 'student@example.com',
      password: 'student123',
      role: 'student',
    });

    // 创建示例课程
    await Course.create({
      name: '高等数学',
      code: 'MATH101',
      description: '高等数学基础课程',
      teacher: teacher._id,
      students: [student._id],
      schedule: {
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:40',
        classroom: 'A101',
      },
      credits: 4,
    });

    await Course.create({
      name: 'Python编程基础',
      code: 'CS101',
      description: 'Python 程序设计入门',
      teacher: teacher._id,
      students: [student._id],
      schedule: {
        dayOfWeek: 3,
        startTime: '14:00',
        endTime: '15:40',
        classroom: 'B203',
      },
      credits: 3,
    });

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Seed data error:', error.message);
  }
};

module.exports = seedData;
