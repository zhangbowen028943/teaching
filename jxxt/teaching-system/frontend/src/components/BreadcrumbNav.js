import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useLocation, Link } from 'react-router-dom';

/**
 * 路由名称映射表
 */
const routeNameMap = {
  '/': '仪表盘',
  '/courses': '课程管理',
  '/students': '学生管理',
  '/teachers': '教师管理',
  '/assignments': '作业管理',
  '/resources': '资源中心',
  '/schedule': '课程表',
  '/profile': '个人资料',
  '/login': '登录',
  '/register': '注册',
};

/**
 * 面包屑导航组件
 * 根据当前路由自动生成面包屑
 */
const BreadcrumbNav = () => {
  const location = useLocation();

  const pathSnippets = location.pathname.split('/').filter((i) => i);

  // 生成面包屑项
  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeOutlined /> 首页
        </Link>
      ),
    },
  ];

  // 如果有子路径，逐级生成
  if (pathSnippets.length > 0) {
    const currentPath = `/${pathSnippets[0]}`;
    const routeName = routeNameMap[currentPath] || pathSnippets[0];

    breadcrumbItems.push({
      title: pathSnippets.length > 1 ? (
        <Link to={currentPath}>{routeName}</Link>
      ) : (
        routeName
      ),
    });
  }

  // 处理更深层级（如 /courses/:id）
  if (pathSnippets.length > 1) {
    for (let i = 1; i < pathSnippets.length; i++) {
      const snippet = pathSnippets[i];
      const isLast = i === pathSnippets.length - 1;
      breadcrumbItems.push({
        title: isLast ? snippet : <Link to={`/${pathSnippets.slice(0, i + 1).join('/')}`}>{snippet}</Link>,
      });
    }
  }

  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{ marginBottom: 16 }}
    />
  );
};

export default BreadcrumbNav;