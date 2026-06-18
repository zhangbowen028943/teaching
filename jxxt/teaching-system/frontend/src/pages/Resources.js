import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, message, Tag, Popconfirm, Upload } from 'antd';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../services/api';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const user = JSON.parse(localStorage.getItem('user'));
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resources');
      setResources(res.data || []);
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

  useEffect(() => { fetchResources(); fetchCourses(); }, []);

  const handleCreate = async (values) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description || '');
    formData.append('course', values.course);
    if (fileList[0]) {
      formData.append('file', fileList[0].originFileObj);
    }
    try {
      await api.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('上传成功');
      setModalOpen(false);
      form.resetFields();
      setFileList([]);
      fetchResources();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/resources/${id}`);
      message.success('删除成功');
      fetchResources();
    } catch { /* ignore */ }
  };

  const handleDownload = (record) => {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:5000/api/resources/${record._id}/download?token=${token}`, '_blank');
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '描述', dataIndex: 'description', key: 'description', render: (v) => v || '-' },
    { title: '课程', key: 'course', render: (_, r) => r.course?.name || '-' },
    { title: '文件名', key: 'file', render: (_, r) => r.file?.originalName || '-' },
    { title: '上传者', key: 'uploader', render: (_, r) => r.uploadedBy?.username || '-' },
    { title: '下载量', dataIndex: 'downloads', key: 'downloads', width: 80 },
    {
      title: '操作', key: 'action', width: 200,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(record)}>下载</Button>
          {isTeacher && (
            <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
              <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="资源中心"
        extra={isTeacher && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setFileList([]); setModalOpen(true); }}>
            上传资源
          </Button>
        )}
      >
        <Table columns={columns} dataSource={resources} rowKey="_id" loading={loading} />
      </Card>

      <Modal title="上传资源" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} width={500}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="资源标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="course" label="所属课程" rules={[{ required: true }]}>
            <Select placeholder="选择课程">
              {courses.map((c) => <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="文件" required>
            <Upload fileList={fileList} onChange={({ fileList }) => setFileList(fileList)} beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Resources;