import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  FolderOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import useAuth from '../hooks/useAuth';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isTeacher, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const getMenuItems = () => {
    const items = [
      { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
      { key: '/courses', icon: <BookOutlined />, label: '课程管理' },
    ];

    if (isAdmin) {
      items.push(
        { key: '/teachers', icon: <UserOutlined />, label: '教师管理' },
        { key: '/students', icon: <TeamOutlined />, label: '学生管理' }
      );
    }

    if (isAdmin || isTeacher) {
      items.push({ key: '/assignments', icon: <FileTextOutlined />, label: '作业管理' });
    }

    items.push(
      { key: '/resources', icon: <FolderOutlined />, label: '资源中心' },
      { key: '/schedule', icon: <ScheduleOutlined />, label: '课程表' }
    );

    return items;
  };

  return (
    <Sider width={200} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname === '/' ? '/' : '/' + location.pathname.split('/')[1]]}
        style={{ height: '100%', paddingTop: '16px' }}
        items={getMenuItems()}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default Sidebar;