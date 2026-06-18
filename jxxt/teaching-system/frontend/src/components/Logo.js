import React from 'react';
import { Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const Logo = ({ size = 32, collapsed = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <BookOutlined style={{ fontSize: size, color: '#1890ff' }} />
    {!collapsed && (
      <Typography.Text
        strong
        style={{ fontSize: Math.max(size * 0.5, 16), color: '#1890ff', whiteSpace: 'nowrap' }}
      >
        教学管理系统
      </Typography.Text>
    )}
  </div>
);

export default Logo;