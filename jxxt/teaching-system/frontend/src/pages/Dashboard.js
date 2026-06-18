import React, { useState, useEffect } from 'react';
import { Row, Col, List, Badge } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { StatCard, PieChart, BarChart } from '../components/Charts';
import { useThemeContext } from '../context/ThemeContext';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import moment from 'moment';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useThemeContext();
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, actRes] = await Promise.allSettled([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activities'),
        ]);

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data || {});
        } else {
          setError('获取统计数据失败');
        }

        if (actRes.status === 'fulfilled') {
          setActivities(actRes.value.data || []);
        }
      } catch (err) {
        setError(err?.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 课程分布数据（饼图）
  const courseDistributionData = stats.courseDistribution || [];
  // 近期作业统计（柱状图）
  const assignmentStatsData = stats.assignmentStats || [];

  const statCards = () => {
    if (isAdmin) {
      return (
        <>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="学生总数"
              value={stats.studentCount ?? 0}
              prefix={<TeamOutlined />}
              color="#3f8600"
              trend={stats.studentTrend}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="教师总数"
              value={stats.teacherCount ?? 0}
              prefix={<UserOutlined />}
              color="#1890ff"
              trend={stats.teacherTrend}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="课程总数"
              value={stats.courseCount ?? 0}
              prefix={<BookOutlined />}
              color="#722ed1"
              trend={stats.courseTrend}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="作业总数"
              value={stats.assignmentCount ?? 0}
              prefix={<FileTextOutlined />}
              color="#faad14"
              trend={stats.assignmentTrend}
              loading={loading}
            />
          </Col>
        </>
      );
    }
    if (isTeacher) {
      return (
        <>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="我的课程"
              value={stats.courseCount ?? 0}
              prefix={<BookOutlined />}
              color="#1890ff"
              trend={stats.courseTrend}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="已发布作业"
              value={stats.assignmentCount ?? 0}
              prefix={<FileTextOutlined />}
              color="#722ed1"
              trend={stats.assignmentTrend}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="学生人数"
              value={stats.studentCount ?? 0}
              prefix={<TeamOutlined />}
              color="#3f8600"
              trend={stats.studentTrend}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="待批作业"
              value={stats.pendingSubmissions ?? 0}
              prefix={<ClockCircleOutlined />}
              color="#faad14"
              trend={stats.pendingTrend}
              loading={loading}
            />
          </Col>
        </>
      );
    }
    return (
      <>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="已选课程"
            value={stats.courseCount ?? 0}
            prefix={<BookOutlined />}
            color="#1890ff"
            trend={stats.courseTrend}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="待交作业"
            value={stats.pendingCount ?? 0}
            prefix={<ClockCircleOutlined />}
            color="#faad14"
            trend={stats.pendingTrend}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="已提交"
            value={stats.submittedCount ?? 0}
            prefix={<CheckCircleOutlined />}
            color="#3f8600"
            trend={stats.submittedTrend}
            loading={loading}
          />
        </Col>
      </>
    );
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>{statCards()}</Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <PieChart
            title="课程分布"
            data={courseDistributionData}
            isDark={isDark}
            loading={loading}
            error={error}
          />
        </Col>
        <Col xs={24} md={12}>
          <BarChart
            title="近期作业统计"
            data={assignmentStatsData}
            isDark={isDark}
            loading={loading}
            error={error}
            color="#722ed1"
          />
        </Col>
      </Row>

      {/* 近期活动和快速入口 */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={16}>
          <List
            header={<strong>近期活动</strong>}
            bordered
            dataSource={activities}
            loading={loading}
            locale={{ emptyText: '暂无活动' }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.title}
                  description={item.time ? moment(item.time).fromNow() : ''}
                />
              </List.Item>
            )}
          />
        </Col>
        <Col xs={24} md={8}>
          <List
            header={<strong>快速入口</strong>}
            bordered
          >
            <List.Item>
              <Badge status="processing" text={`当前时间：${moment().format('YYYY-MM-DD HH:mm')}`} />
            </List.Item>
            <List.Item>
              <Badge status="default" text={`角色：${isAdmin ? '管理员' : isTeacher ? '教师' : '学生'}`} />
            </List.Item>
          </List>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;