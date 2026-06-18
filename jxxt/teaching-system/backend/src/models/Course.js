const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '请输入课程名称'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, '请输入课程代码'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '请选择授课教师'],
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    schedule: {
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6,
        default: 1,
      },
      startTime: {
        type: String,
        default: '08:00',
      },
      endTime: {
        type: String,
        default: '09:40',
      },
      classroom: {
        type: String,
        default: '',
      },
    },
    credits: {
      type: Number,
      default: 2,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', courseSchema);
