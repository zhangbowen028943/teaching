import React, { useState, useCallback } from 'react';
import { Button, Space, Modal, Form, Input, Select, Upload, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import DataTable from '../components/DataTable';
import api from '../services/api';

const Resources = () => {
  const [courses, setCourses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const user = JSON.parse(localStorage.getItem('user'));
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const fetchCourses = useCallback(async () => {
    if (isTeacher) {
      try {
        const res = await api.get('/courses');
        setCourses(Array.isArray(res) ? res : (res.data || []));
      } catch { /* ignore */ }
    }
  }, [isTeacher]);

  const fetchData = useCallback(async (params) => {
    const res = await api.get('/resources', { params });
    if (Array.isArray(res)) {
      return { data: res, pagination: { total: res.length } };
    }
    return {
      data: res.data || [],
      pagination: res.pagination || { total: (res.data || []).length },
    };
  }, []);

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
      setRefreshKey((k) => k + 1);
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/resources/${id}`);
      message.success('删除成功');
      setRefreshKey((k) => k + 1);
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
      <DataTable
        key={refreshKey}
        columns={columns}
        fetchData={fetchData}
        searchPlaceholder="搜索资源标题"
        searchFields={['keyword']}
        extra={
          isTeacher && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { fetchCourses(); form.resetFields(); setFileList([]); setModalOpen(true); }}
            >
              上传资源
            </Button>
          )
        }
      />

      <Modal
        title="上传资源"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        width={500}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} preserve={false}>
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
            <Upload
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl)}
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Resources;