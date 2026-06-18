const Course = require('../models/Course');
const User = require('../models/User');

exports.getCourses = async (req, res, next) => {
  try {
    const { search, teacher } = req.query;
    const { skip, limit, sort, search: paginationSearch, searchFields } = req.pagination;
    const filter = {};

    // 优先使用 pagination 的 search，其次使用 query 中的 search
    const searchTerm = paginationSearch || search;
    if (searchTerm) {
      if (searchFields.length > 0) {
        filter.$or = searchFields.map((field) => ({
          [field]: { $regex: searchTerm, $options: 'i' },
        }));
      } else {
        filter.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
          { code: { $regex: searchTerm, $options: 'i' } },
        ];
      }
    }
    if (teacher) filter.teacher = teacher;

    // 学生只看自己选修的课程
    if (req.user.role === 'student') {
      filter.students = req.user._id;
    }

    // 教师只看自己的课程
    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('teacher', 'username email')
        .populate('students', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Course.countDocuments(filter),
    ]);

    res.paginate(courses, total);
  } catch (error) {
    next(error);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'username email')
      .populate('students', 'username email');

    if (!course) {
      const error = new Error('课程不存在');
      error.status = 404;
      throw error;
    }

    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const { name, code, description, teacher, schedule, credits } = req.body;

    // 教师只能创建自己的课程
    let teacherId = teacher;
    if (req.user.role === 'teacher') {
      teacherId = req.user._id;
    }

    const course = await Course.create({
      name,
      code,
      description,
      teacher: teacherId,
      schedule,
      credits,
    });

    await course.populate('teacher', 'username email');

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      const error = new Error('课程不存在');
      error.status = 404;
      throw error;
    }

    // 教师只能修改自己的课程
    if (
      req.user.role === 'teacher' &&
      course.teacher.toString() !== req.user._id.toString()
    ) {
      const error = new Error('权限不足');
      error.status = 403;
      throw error;
    }

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('teacher', 'username email')
      .populate('students', 'username email');

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      const error = new Error('课程不存在');
      error.status = 404;
      throw error;
    }

    if (
      req.user.role === 'teacher' &&
      course.teacher.toString() !== req.user._id.toString()
    ) {
      const error = new Error('权限不足');
      error.status = 403;
      throw error;
    }

    await course.deleteOne();
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    next(error);
  }
};

exports.joinCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      const error = new Error('课程不存在');
      error.status = 404;
      throw error;
    }

    if (course.students.includes(req.user._id)) {
      const error = new Error('已选修该课程');
      error.status = 400;
      throw error;
    }

    course.students.push(req.user._id);
    await course.save();
    await course.populate('students', 'username email');

    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

exports.leaveCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      const error = new Error('课程不存在');
      error.status = 404;
      throw error;
    }

    course.students = course.students.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await course.save();

    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};