const Resource = require('../models/Resource');
const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');

exports.getResources = async (req, res, next) => {
  try {
    const { course, search } = req.query;
    const { skip, limit, sort, search: paginationSearch } = req.pagination;
    const filter = {};

    if (course) filter.course = course;

    // 优先使用 pagination 的 search，其次使用 query 中的 search
    const searchTerm = paginationSearch || search;
    if (searchTerm) filter.title = { $regex: searchTerm, $options: 'i' };

    if (req.user.role === 'student') {
      const courses = await Course.find({ students: req.user._id }).select('_id');
      filter.course = { $in: courses.map((c) => c._id) };
    } else if (req.user.role === 'teacher') {
      const courses = await Course.find({ teacher: req.user._id }).select('_id');
      filter.course = { $in: courses.map((c) => c._id) };
    }

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .populate('course', 'name code')
        .populate('uploadedBy', 'username')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Resource.countDocuments(filter),
    ]);

    res.paginate(resources, total);
  } catch (error) {
    next(error);
  }
};

exports.createResource = async (req, res, next) => {
  try {
    const { title, description, course } = req.body;

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
      const error = new Error('只能为自己课程上传资源');
      error.status = 403;
      throw error;
    }

    if (!req.file) {
      const error = new Error('请上传文件');
      error.status = 400;
      throw error;
    }

    const resource = await Resource.create({
      title,
      description,
      course,
      uploadedBy: req.user._id,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });

    await resource.populate('course', 'name code');
    await resource.populate('uploadedBy', 'username');

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
};

exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      const error = new Error('资源不存在');
      error.status = 404;
      throw error;
    }

    if (
      req.user.role === 'teacher' &&
      resource.uploadedBy.toString() !== req.user._id.toString()
    ) {
      const error = new Error('权限不足');
      error.status = 403;
      throw error;
    }

    if (resource.file?.path) {
      const filePath = path.resolve(resource.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await resource.deleteOne();
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    next(error);
  }
};

exports.downloadResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      const error = new Error('资源不存在');
      error.status = 404;
      throw error;
    }

    resource.downloads += 1;
    await resource.save();

    const filePath = path.resolve(resource.file.path);
    res.download(filePath, resource.file.originalName);
  } catch (error) {
    next(error);
  }
};