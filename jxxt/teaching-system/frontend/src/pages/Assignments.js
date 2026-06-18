import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, Select, DatePicker, message, Tag, Popconfirm, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../services/api';
import moment from 'moment';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [form] = Form.useForm();
  const [submitForm] = Form.useForm();

  const user = JSON.parse(localStorage.getItem('user'));
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data || []);
    } finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    if (isTeacher) {
      try {
        const res = await api.get('/courses');
        setCourses(res.data || []);
      } catch { /* ignore */ }
    }
  };

  useEffect(() => { fetchAssignments(); fetchCourses(); }, []);

  const handleCreate = async (values) => {
    try {
      await api.post('/assignments', values);
      message.success('创建成功');
      setModalOpen(false);
      form.resetFields();
      fetchAssignments();
    } catch { /* ignore */ }
  };

  const handleUpdate = async (values) => {
    try {
      await api.put(`/assignments/${editingAssignment._id}`, values);
      message.success('更新成功');
      setEditModalOpen(false);
      setEditingAssignment(null);
      fetchAssignments();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/assignments/${id}`);
      message.success('删除成功');
      fetchAssignments();
    } catch { /* ignore */ }
  };

  const handleSubmitAssignment = async (values) => {
    try {
      await api.post(`/assignments/${editingAssignment._id}/submit`, values);
      message.success('提交成功');
      setSubmissionModalOpen(false);
      submitForm.resetFields();
    } catch { /* ignore */ }
  };

  const handleViewSubmissions = async (assignment) => {
    setSubmissionLoading(true);
    try {
      const res = await api.get('/assignments/submissions', { params: { assignment: assignment._id } });
      setSubmissions(res.data || []);
      setEditingAssignment(assignment);
      setSubmissionModalOpen(true);
    } finally { setSubmissionLoading(false); }
  };

  const handleGrade = async (submissionId, score, feedback) => {
    try {
      await api.put(`/assignments/submissions/${submissionId}/grade`, { score, feedback });
      message.success('评分成功');
      handleViewSubmissions(editingAssignment);
    } catch { /* ignore */ }
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '课程', key: 'course', render: (_, r) => r.course?.name || '-' },
    { title: '满分', dataIndex: 'totalScore', key: 'totalScore', width: 80 },
    {
      title: '截止时间', dataIndex: 'deadline', key: 'deadline',
      render: (v) => v ? moment(v).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (s) => {
        const map = { draft: '草稿', published: '已发布', closed: '已关闭' };
        const color = { draft: 'default', published: 'green', closed: 'red' };
        return <Tag color={color[s]}>{map[s]}</Tag>;
      },
    },
    {
      title: '操作', key: 'action', width: 200,
      render: (_, record) => (
        <Space>
          {isTeacher && (
            <>
              <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingAssignment(record); form.setFieldsValue({ ...record, deadline: record.deadline ? moment(record.deadline) : null }); setEditModalOpen(true); }}>编辑</Button>
              <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewSubmissions(record)}>查看提交</Button>
              <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
                <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
              </Popconfirm>
            </>
          )}
          {isStudent && (
            <Button size="small" type="primary" onClick={() => { setEditingAssignment(record); setSubmissionModalOpen(true); }}>提交</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="作业管理"
        extra={isTeacher && <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>发布作业</Button>}
      >
        <Table columns={columns} dataSource={assignments} rowKey="_id" loading={loading} />
      </Card>

      {/* 创建作业 */}
      <Modal title="发布作业" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} width={600}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="作业标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="作业描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="course" label="所属课程" rules={[{ required: true }]}>
            <Select placeholder="选择课程">
              {courses.map((c) => <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="totalScore" label="满分" initialValue={100}>
            <InputNumber min={1} max={1000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="deadline" label="截止时间" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑作业 */}
      <Modal title="编辑作业" open={editModalOpen} onCancel={() => setEditModalOpen(false)} onOk={() => form.submit()} width={600}>
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="deadline" label="截止时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 学生提交 */}
      <Modal title="提交作业" open={submissionModalOpen} onCancel={() => setSubmissionModalOpen(false)} onOk={() => submitForm.submit()}>
        <Form form={submitForm} layout="vertical" onFinish={handleSubmitAssignment}>
          <Form.Item name="content" label="提交内容" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Assignments;