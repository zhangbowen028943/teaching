import React from 'react'
import { Typography, Grid } from 'antd'
import { BookOutlined } from '@ant-design/icons'

const { useBreakpoint } = Grid

const Logo = ({ size = 32, collapsed = false }) => {
  const screens = useBreakpoint()

  // 小屏幕（xs）下隐藏文字，只显示图标
  const isSmallScreen = !screens.sm && !screens.md && !screens.lg && !screens.xl
  const shouldShowText = !collapsed && !isSmallScreen

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <BookOutlined style={{ fontSize: size, color: '#1890ff' }} />
      {shouldShowText && (
        <Typography.Text
          strong
          style={{
            fontSize: Math.max(size * 0.5, 16),
            color: '#1890ff',
            whiteSpace: 'nowrap',
          }}
        >
          教学管理系统
        </Typography.Text>
      )}
    </div>
  )
}

export default Logo