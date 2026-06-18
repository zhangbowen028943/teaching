import React from 'react';
import { BookOutlined } from '@ant-design/icons';

const Logo = ({ size = 32 }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '8px',
          background: '#1890ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BookOutlined style={{ color: '#fff', fontSize: size * 0.55 }} />
      </div>
      <span
        style={{
          fontSize: size * 0.6,
          fontWeight: 600,
          color: '#1890ff',
          whiteSpace: 'nowrap',
        }}
      >
        教学管理系统
      </span>
    </div>
  );
};

export default Logo;
