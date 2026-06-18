import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, InputNumber, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const Courses = () => {
  const { isAdmin, isTeacher, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      setCourses(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    if (isAdmin) {
      try {
        const res = await api.get('/users/teachers');
        setTeachers(res.data || []);
      } catch { /* ignore */ }
    }
  };

  useEffect(() => { fetchCourses(); fetchTeachers(); }, []);

  const handleSubmit = async (values) => {
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse._id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/courses', values);
        message.success('创建成功');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingCourse(null);
      fetchCourses();
    } catch { /* api interceptor handles error */ }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      message.success('删除成功');
      fetchCourses();
    } catch { /* ignore */ }
  };

  const handleJoinCourse = async (id) => {
    try {
      await api.post(`/courses/${id}/join`);
      message.success('选课成功');
      fetchCourses();
    } catch { /* ignore */ }
  };

  const handleLeaveCourse = async (id) => {
    try {
      await api.post(`/courses/${id}/leave`);
      message.success('退课成功');
      fetchCourses();
    } catch { /* ignore */ }
  };

  const columns = [
    { title: '课程代码', dataIndex: 'code', key: 'code', width: 100 },
    { title: '课程名称', dataIndex: 'name', key: 'name' },
    { title: '授课教师', key: 'teacher', render: (_, r) => r.teacher?.username || '-' },
    { title: '学分', dataIndex: 'credits', key: 'credits', width: 80 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (s) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '进行中' : '已停用'}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 220,
      render: (_, record) => (
        <Space>
          {(isAdmin || (isTeacher && record.teacher?._id === user?.id)) && (
            <>
              <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingCourse(record); form.setFieldsValue(record); setModalOpen(true); }}>编辑</Button>
              <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
                <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
              </Popconfirm>
            </>
          )}
          {user?.role === 'student' && record.students?.some((s) => s._id === user?.id) ? (
            <Button size="small" onClick={() => handleLeaveCourse(record._id)}>退课</Button>
          ) : user?.role === 'student' && (
            <Button size="small" type="primary" onClick={() => handleJoinCourse(record._id)}>选课</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="课程管理"
        extra={
          (isAdmin || isTeacher) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCourse(null); form.resetFields(); setModalOpen(true); }}>
              创建课程
            </Button>
          )
        }
      >
        <Table columns={columns} dataSource={courses} rowKey="_id" loading={loading} />
      </Card>

      <Modal
        title={editingCourse ? '编辑课程' : '创建课程'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingCourse(null); form.resetFields(); }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="课程名称" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="例如：高等数学" />
          </Form.Item>
          <Form.Item name="code" label="课程代码" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="例如：MATH101" />
          </Form.Item>
          <Form.Item name="description" label="课程描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="credits" label="学分" initialValue={2}>
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
          {isAdmin && (
            <Form.Item name="teacher" label="授课教师" rules={[{ required: true }]}>
              <Select placeholder="选择教师">
                {teachers.map((t) => <Select.Option key={t._id} value={t._id}>{t.username}</Select.Option>)}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Courses;