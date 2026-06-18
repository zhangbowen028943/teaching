import React, { useState, useCallback } from 'react';
import { Button, Space, Modal, Form, Input, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import DataTable from '../components/DataTable';
import api from '../services/api';

const Students = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form] = Form.useForm();

  const fetchData = useCallback(async (params) => {
    const res = await api.get('/users', { params: { ...params, role: 'student' } });
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
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/users', { ...values, role: 'student' });
        message.success('创建成功');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingUser(null);
      setRefreshKey((k) => k + 1);
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      message.success('删除成功');
      setRefreshKey((k) => k + 1);
    } catch { /* ignore */ }
  };

  const openModal = (record) => {
    if (record) {
      setEditingUser(record);
      form.setFieldsValue(record);
    } else {
      setEditingUser(null);
      form.resetFields();
    }
    setModalOpen(true);
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
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
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
        searchPlaceholder="搜索学生姓名或邮箱"
        searchFields={['keyword']}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
            添加学生
          </Button>
        }
      />

      <Modal
        title={editingUser ? '编辑学生' : '添加学生'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingUser(null); form.resetFields(); }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} preserve={false}>
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

export default Students;