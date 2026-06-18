import React from 'react';
import { Layout, Avatar, Dropdown, Button, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import useAuth from '../hooks/useAuth';

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const roleMap = { admin: '管理员', teacher: '教师', student: '学生' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人资料', onClick: () => navigate('/profile') },
    { key: 'settings', icon: <SettingOutlined />, label: '设置', onClick: () => navigate('/profile') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ];

  return (
    <Header style={{
      background: '#001529',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 10,
    }}>
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <Logo size={28} />
      </div>

      {isAuthenticated ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Typography.Text style={{ color: '#fff' }}>
            {roleMap[user?.role]}：{user?.username}
          </Typography.Text>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar style={{ cursor: 'pointer', backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
          </Dropdown>
        </div>
      ) : (
        <div>
          <Button type="link" onClick={() => navigate('/register')} style={{ color: '#fff' }}>注册</Button>
          <Button ghost onClick={() => navigate('/login')}>登录</Button>
        </div>
      )}
    </Header>
  );
};

export default Navbar;