const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Submission = require('../models/Submission');

exports.getAssignments = async (req, res, next) => {
  try {
    const { course } = req.query;
    const filter = {};

    if (course) filter.course = course;

    if (req.user.role === 'student') {
      // 学生查看已选课程相关的作业
      const courses = await Course.find({ students: req.user._id }).select('_id');
      filter.course = { $in: courses.map((c) => c._id) };
    } else if (req.user.role === 'teacher') {
      const courses = await Course.find({ teacher: req.user._id }).select('_id');
      filter.course = { $in: courses.map((c) => c._id) };
      filter.teacher = req.user._id;
    }

    const assignments = await Assignment.find(filter)
      .populate('course', 'name code')
      .populate('teacher', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

exports.getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'name code')
      .populate('teacher', 'username email');

    if (!assignment) {
      const error = new Error('作业不存在');
      error.status = 404;
      throw error;
    }

    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const { title, description, course, deadline, totalScore } = req.body;

    const targetCourse = await Course.findById(course);
    if (!targetCourse) {
      const error = new Error('课程不存在');
      error.status = 404;
      throw error;
    }

    if (
      req.user.role === 'teacher' &&
      targetCourse.teacher.toString() !== req.user._id.toString()
    ) {
      const error = new Error('只能为自己的课程发布作业');
      error.status = 403;
      throw error;
    }

    const assignment = await Assignment.create({
      title,
      description,
      course,
      teacher: req.user._id,
      deadline,
      totalScore,
    });

    await assignment.populate('course', 'name code');

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      const error = new Error('作业不存在');
      error.status = 404;
      throw error;
    }

    if (
      req.user.role === 'teacher' &&
      assignment.teacher.toString() !== req.user._id.toString()
    ) {
      const error = new Error('权限不足');
      error.status = 403;
      throw error;
    }

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'name code');

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      const error = new Error('作业不存在');
      error.status = 404;
      throw error;
    }

    if (
      req.user.role === 'teacher' &&
      assignment.teacher.toString() !== req.user._id.toString()
    ) {
      const error = new Error('权限不足');
      error.status = 403;
      throw error;
    }

    await assignment.deleteOne();
    await Submission.deleteMany({ assignment: req.params.id });

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    next(error);
  }
};

exports.getSubmissions = async (req, res, next) => {
  try {
    const { assignment } = req.query;
    const filter = {};

    if (assignment) filter.assignment = assignment;
    if (req.user.role === 'student') filter.student = req.user._id;

    const submissions = await Submission.find(filter)
      .populate('student', 'username email')
      .populate('assignment', 'title deadline totalScore')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
};

exports.submitAssignment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      const error = new Error('作业不存在');
      error.status = 404;
      throw error;
    }

    const attachments = req.files
      ? req.files.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
        }))
      : [];

    let submission = await Submission.findOne({
      assignment: req.params.id,
      student: req.user._id,
    });

    if (submission) {
      submission.content = content;
      if (attachments.length) submission.attachments = attachments;
      submission.submittedAt = new Date();
    } else {
      submission = await Submission.create({
        assignment: req.params.id,
        student: req.user._id,
        course: assignment.course,
        content,
        attachments,
      });
    }

    // 判断是否逾期
    if (new Date() > new Date(assignment.deadline)) {
      submission.status = 'late';
    }
    await submission.save();

    await submission.populate('student', 'username email');
    await submission.populate('assignment', 'title');

    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

exports.gradeSubmission = async (req, res, next) => {
  try {
    const { score, feedback } = req.body;
    const submission = await Submission.findById(req.params.submissionId)
      .populate('assignment')
      .populate('student', 'username email');

    if (!submission) {
      const error = new Error('提交记录不存在');
      error.status = 404;
      throw error;
    }

    if (
      req.user.role === 'teacher' &&
      submission.assignment.teacher.toString() !== req.user._id.toString()
    ) {
      const error = new Error('权限不足');
      error.status = 403;
      throw error;
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.status = 'graded';
    await submission.save();

    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};
