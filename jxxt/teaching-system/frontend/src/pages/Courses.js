import React, { useState, useCallback } from 'react';
import { Button, Space, Modal, Form, Input, Select, InputNumber, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import DataTable from '../components/DataTable';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const Courses = () => {
  const { isAdmin, isTeacher, user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form] = Form.useForm();

  const fetchTeachers = useCallback(async () => {
    if (isAdmin) {
      try {
        const res = await api.get('/users/teachers');
        setTeachers(res.data || []);
      } catch { /* ignore */ }
    }
  }, [isAdmin]);

  // 打开创建/编辑弹窗时加载教师列表
  const openModal = useCallback((record) => {
    if (isAdmin) fetchTeachers();
    if (record) {
      setEditingCourse(record);
      form.setFieldsValue(record);
    } else {
      setEditingCourse(null);
      form.resetFields();
    }
    setModalOpen(true);
  }, [isAdmin, fetchTeachers, form]);

  const fetchData = useCallback(async (params) => {
    const res = await api.get('/courses', { params });
    // API 返回 { data: [...], pagination: { total: N } } 或直接是数组
    if (Array.isArray(res)) {
      return { data: res, pagination: { total: res.length } };
    }
    return {
      data: res.data || [],
      pagination: res.pagination || { total: (res.data || []).length },
    };
  }, []);

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
      setRefreshKey((k) => k + 1);
    } catch { /* api interceptor handles error */ }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      message.success('删除成功');
      setRefreshKey((k) => k + 1);
    } catch { /* ignore */ }
  };

  const handleJoinCourse = async (id) => {
    try {
      await api.post(`/courses/${id}/join`);
      message.success('选课成功');
      setRefreshKey((k) => k + 1);
    } catch { /* ignore */ }
  };

  const handleLeaveCourse = async (id) => {
    try {
      await api.post(`/courses/${id}/leave`);
      message.success('退课成功');
      setRefreshKey((k) => k + 1);
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
              <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>编辑</Button>
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
      <DataTable
        key={refreshKey}
        columns={columns}
        fetchData={fetchData}
        searchPlaceholder="搜索课程名称或课程代码"
        searchFields={['keyword']}
        extra={
          (isAdmin || isTeacher) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
              创建课程
            </Button>
          )
        }
      />

      <Modal
        title={editingCourse ? '编辑课程' : '创建课程'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingCourse(null); form.resetFields(); }}
        onOk={() => form.submit()}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} preserve={false}>
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