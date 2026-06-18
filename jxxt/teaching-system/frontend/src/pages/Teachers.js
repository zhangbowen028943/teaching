import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users?role=teacher');
      setTeachers(res.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/users', { ...values, role: 'teacher' });
        message.success('创建成功');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingUser(null);
      fetchTeachers();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      message.success('删除成功');
      fetchTeachers();
    } catch { /* ignore */ }
  };

  const columns = [
    { title: '姓名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '手机', dataIndex: 'phone', key: 'phone', render: (v) => v || '-' },
    {
      title: '状态', dataIndex: 'isActive', key: 'isActive',
      render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? '正常' : '禁用'}</Tag>,
    },
    {
      title: '操作', key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingUser(record); form.setFieldsValue(record); setModalOpen(true); }}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="教师管理"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingUser(null); form.resetFields(); setModalOpen(true); }}>添加教师</Button>}
      >
        <Table columns={columns} dataSource={teachers} rowKey="_id" loading={loading} />
      </Card>

      <Modal
        title={editingUser ? '编辑教师' : '添加教师'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingUser(null); form.resetFields(); }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="username" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码" rules={[{ required: true, min: 6 }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="phone" label="手机">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Teachers;