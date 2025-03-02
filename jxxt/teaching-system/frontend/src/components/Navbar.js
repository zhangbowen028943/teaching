import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const userMenu = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  return (
    <Header style={{ 
      background: '#fff', 
      padding: '0 24px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <Logo size={36} />
      </div>
      
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: 16 }}>
            欢迎，{user.role === 'admin' ? '管理员' : 
                   user.role === 'teacher' ? '教师' : '学生'} {user.username}
          </span>
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <Avatar 
              style={{ 
                cursor: 'pointer',
                backgroundColor: '#1890ff'
              }} 
              icon={<UserOutlined />}
            />
          </Dropdown>
        </div>
      ) : (
        <div>
          <Button 
            type="link" 
            onClick={() => navigate('/register')}
            style={{ marginRight: 16 }}
          >
            注册
          </Button>
          <Button 
            type="primary" 
            onClick={() => navigate('/login')}
          >
            登录
          </Button>
        </div>
      )}
    </Header>
  );
};

export default Navbar; 