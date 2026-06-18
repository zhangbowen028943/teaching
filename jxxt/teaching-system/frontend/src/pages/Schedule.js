import React, { useState, useEffect } from 'react';
import { Card, Table, Tag } from 'antd';
import api from '../services/api';
import moment from 'moment';

const dayMap = ['日', '一', '二', '三', '四', '五', '六'];

const Schedule = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await api.get('/courses');
        setCourses(res.data || []);
      } finally { setLoading(false); }
    };
    fetchCourses();
  }, []);

  const columns = [
    { title: '课程名称', dataIndex: 'name', key: 'name' },
    { title: '课程代码', dataIndex: 'code', key: 'code' },
    {
      title: '上课时间', key: 'schedule',
      render: (_, r) => r.schedule
        ? `周${dayMap[r.schedule.dayOfWeek]} ${r.schedule.startTime}-${r.schedule.endTime}`
        : '-',
    },
    {
      title: '教室', key: 'classroom',
      render: (_, r) => r.schedule?.classroom || '-',
    },
    { title: '授课教师', key: 'teacher', render: (_, r) => r.teacher?.username || '-' },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '进行中' : '已停用'}</Tag>,
    },
  ];

  return (
    <div>
      <Card title="课程表">
        <Table columns={columns} dataSource={courses} rowKey="_id" loading={loading} />
      </Card>
    </div>
  );
};

export default Schedule;