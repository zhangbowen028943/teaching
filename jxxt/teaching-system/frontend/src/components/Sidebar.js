import React from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  FolderOutlined,
  ScheduleOutlined
} from '@ant-design/icons';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // 根据用户角色显示不同的菜单项
  const getMenuItems = () => {
    const items = [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: '仪表盘'
      },
      {
        key: '/courses',
        icon: <BookOutlined />,
        label: '课程管理'
      }
    ];

    if (user?.role === 'admin') {
      items.push(
        {
          key: '/teachers',
          icon: <UserOutlined />,
          label: '教师管理'
        },
        {
          key: '/students',
          icon: <TeamOutlined />,
          label: '学生管理'
        }
      );
    }

    if (user?.role === 'teacher' || user?.role === 'admin') {
      items.push(
        {
          key: '/assignments',
          icon: <FileTextOutlined />,
          label: '作业管理'
        }
      );
    }

    items.push(
      {
        key: '/resources',
        icon: <FolderOutlined />,
        label: '资源中心'
      },
      {
        key: '/schedule',
        icon: <ScheduleOutlined />,
        label: '课程表'
      }
    );

    return items;
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      style={{ 
        height: '100%', 
        borderRight: 0,
        paddingTop: '16px'
      }}
      items={getMenuItems()}
      onClick={({ key }) => navigate(key)}
    />
  );
};

export default Sidebar; 