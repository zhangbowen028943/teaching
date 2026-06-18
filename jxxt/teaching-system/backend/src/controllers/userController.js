const User = require('../models/User');

exports.getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      const error = new Error('用户不存在');
      error.status = 404;
      throw error;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await User.create({ username, email, password, role });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { username, email, role, phone, bio, avatar, isActive } = req.body;
    const updateData = { username, email, role, phone, bio, avatar, isActive };

    // 普通用户只能修改自己
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      const error = new Error('权限不足');
      error.status = 403;
      throw error;
    }

    // 非管理员不能修改角色
    if (req.user.role !== 'admin') {
      delete updateData.role;
      delete updateData.isActive;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      const error = new Error('用户不存在');
      error.status = 404;
      throw error;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      const error = new Error('用户不存在');
      error.status = 404;
      throw error;
    }

    res.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    next(error);
  }
};

exports.getTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json({ success: true, data: teachers });
  } catch (error) {
    next(error);
  }
};

exports.getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};
