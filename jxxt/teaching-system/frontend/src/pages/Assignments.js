import React, { useState, useCallback } from 'react';
import { Button, Space, Modal, Form, Input, InputNumber, Select, DatePicker, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import DataTable from '../components/DataTable';
import api from '../services/api';
import moment from 'moment';

const Assignments = () => {
  const [courses, setCourses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form] = Form.useForm();
  const [submitForm] = Form.useForm();

  const user = JSON.parse(localStorage.getItem('user'));
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const fetchCourses = useCallback(async () => {
    if (isTeacher) {
      try {
        const res = await api.get('/courses');
        setCourses(Array.isArray(res) ? res : (res.data || []));
      } catch { /* ignore */ }
    }
  }, [isTeacher]);

  const fetchData = useCallback(async (params) => {
    const res = await api.get('/assignments', { params });
    if (Array.isArray(res)) {
      return { data: res, pagination: { total: res.length } };
    }
    return {
      data: res.data || [],
      pagination: res.pagination || { total: (res.data || []).length },
    };
  }, []);

  const handleCreate = async (values) => {
    try {
      await api.post('/assignments', values);
      message.success('创建成功');
      setModalOpen(false);
      form.resetFields();
      setRefreshKey((k) => k + 1);
    } catch { /* ignore */ }
  };

  const handleUpdate = async (values) => {
    try {
      await api.put(`/assignments/${editingAssignment._id}`, values);
      message.success('更新成功');
      setEditModalOpen(false);
      setEditingAssignment(null);
      setRefreshKey((k) => k + 1);
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/assignments/${id}`);
      message.success('删除成功');
      setRefreshKey((k) => k + 1);
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
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingAssignment(record);
                  form.setFieldsValue({ ...record, deadline: record.deadline ? moment(record.deadline) : null });
                  setEditModalOpen(true);
                }}
              >
                编辑
              </Button>
              <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
                <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
              </Popconfirm>
            </>
          )}
          {isStudent && (
            <Button
              size="small"
              type="primary"
              onClick={() => { setEditingAssignment(record); setSubmissionModalOpen(true); }}
            >
              提交
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        key={refreshKey}
        columns={columns}
        fetchData={fetchData}
        searchPlaceholder="搜索作业标题"
        searchFields={['keyword']}
        extra={
          isTeacher && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { fetchCourses(); form.resetFields(); setModalOpen(true); }}
            >
              发布作业
            </Button>
          )
        }
      />

      {/* 创建作业 */}
      <Modal
        title="发布作业"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} preserve={false}>
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
      <Modal
        title="编辑作业"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate} preserve={false}>
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
      <Modal
        title="提交作业"
        open={submissionModalOpen}
        onCancel={() => setSubmissionModalOpen(false)}
        onOk={() => submitForm.submit()}
        destroyOnClose
      >
        <Form form={submitForm} layout="vertical" onFinish={handleSubmitAssignment} preserve={false}>
          <Form.Item name="content" label="提交内容" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Assignments;