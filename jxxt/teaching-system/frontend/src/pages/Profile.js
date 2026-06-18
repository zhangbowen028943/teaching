import React from 'react';
import { Card, Descriptions, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const roleMap = { admin: '管理员', teacher: '教师', student: '学生' };

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/login');
  };

  if (!user) {
    return <Card><p>请先登录</p></Card>;
  }

  return (
    <div>
      <Card title="个人资料" extra={<Button danger onClick={handleLogout}>退出登录</Button>}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
          <Descriptions.Item label="角色">{roleMap[user.role] || user.role}</Descriptions.Item>
          <Descriptions.Item label="手机">{user.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="简介" span={2}>{user.bio || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default Profile;