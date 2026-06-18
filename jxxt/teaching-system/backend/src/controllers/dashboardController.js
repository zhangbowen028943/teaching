const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Resource = require('../models/Resource');
const Submission = require('../models/Submission');

exports.getStats = async (req, res, next) => {
  try {
    let stats = {};

    if (req.user.role === 'admin') {
      const [studentCount, teacherCount, courseCount, assignmentCount, resourceCount] =
        await Promise.all([
          User.countDocuments({ role: 'student' }),
          User.countDocuments({ role: 'teacher' }),
          Course.countDocuments(),
          Assignment.countDocuments(),
          Resource.countDocuments(),
        ]);

      stats = {
        studentCount,
        teacherCount,
        courseCount,
        assignmentCount,
        resourceCount,
      };
    } else if (req.user.role === 'teacher') {
      const courses = await Course.find({ teacher: req.user._id }).select('_id');
      const courseIds = courses.map((c) => c._id);

      const [courseCount, assignmentCount, pendingSubmissions] = await Promise.all([
        Course.countDocuments({ teacher: req.user._id }),
        Assignment.countDocuments({ teacher: req.user._id }),
        Submission.countDocuments({
          course: { $in: courseIds },
          status: { $in: ['submitted', 'late'] },
        }),
      ]);

      stats = {
        courseCount,
        assignmentCount,
        pendingSubmissions,
        studentCount: courses.reduce((sum, c) => sum + c.students.length, 0),
      };
    } else {
      const courses = await Course.find({ students: req.user._id }).select('_id');
      const courseIds = courses.map((c) => c._id);

      const [courseCount, assignmentCount, submittedCount] = await Promise.all([
        Course.countDocuments({ students: req.user._id }),
        Assignment.countDocuments({ course: { $in: courseIds } }),
        Submission.countDocuments({ student: req.user._id }),
      ]);

      stats = {
        courseCount,
        assignmentCount,
        submittedCount,
        pendingCount: assignmentCount - submittedCount,
      };
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

exports.getRecentActivities = async (req, res, next) => {
  try {
    let activities = [];

    const [recentCourses, recentAssignments, recentResources] = await Promise.all([
      Course.find().sort({ createdAt: -1 }).limit(5).populate('teacher', 'username'),
      Assignment.find().sort({ createdAt: -1 }).limit(5).populate('course', 'name'),
      Resource.find().sort({ createdAt: -1 }).limit(5).populate('uploadedBy', 'username'),
    ]);

    activities = [
      ...recentCourses.map((c) => ({
        type: 'course',
        title: `新课程：${c.name}`,
        time: c.createdAt,
      })),
      ...recentAssignments.map((a) => ({
        type: 'assignment',
        title: `新作业：${a.title}`,
        time: a.createdAt,
      })),
      ...recentResources.map((r) => ({
        type: 'resource',
        title: `新资源：${r.title}`,
        time: r.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8);

    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};
