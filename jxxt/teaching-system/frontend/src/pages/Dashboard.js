import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, List, Badge } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import moment from 'moment';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, actRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activities'),
        ]);
        setStats(statsRes.data || {});
        setActivities(actRes.data || []);
      } catch { /* ignore */ }
    };
    fetchData();
  }, []);

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const statCards = () => {
    if (isAdmin) {
      return (
        <>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="学生总数" value={stats.studentCount || 0} prefix={<TeamOutlined />} valueStyle={{ color: '#3f8600' }} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="教师总数" value={stats.teacherCount || 0} prefix={<UserOutlined />} valueStyle={{ color: '#1890ff' }} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="课程总数" value={stats.courseCount || 0} prefix={<BookOutlined />} valueStyle={{ color: '#722ed1' }} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="作业总数" value={stats.assignmentCount || 0} prefix={<FileTextOutlined />} valueStyle={{ color: '#faad14' }} /></Card>
          </Col>
        </>
      );
    }
    if (isTeacher) {
      return (
        <>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="我的课程" value={stats.courseCount || 0} prefix={<BookOutlined />} valueStyle={{ color: '#1890ff' }} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="已发布作业" value={stats.assignmentCount || 0} prefix={<FileTextOutlined />} valueStyle={{ color: '#722ed1' }} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="学生人数" value={stats.studentCount || 0} prefix={<TeamOutlined />} valueStyle={{ color: '#3f8600' }} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card><Statistic title="待批作业" value={stats.pendingSubmissions || 0} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} /></Card>
          </Col>
        </>
      );
    }
    return (
      <>
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="已选课程" value={stats.courseCount || 0} prefix={<BookOutlined />} valueStyle={{ color: '#1890ff' }} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="待交作业" value={stats.pendingCount || 0} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="已提交" value={stats.submittedCount || 0} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
      </>
    );
  };

  return (
    <div>
      <Row gutter={[16, 16]}>{statCards()}</Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={16}>
          <Card title="近期活动">
            <List
              dataSource={activities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.time ? moment(item.time).fromNow() : ''}
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无活动' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="快速入口">
            <List>
              <List.Item>
                <Badge status="processing" text={`当前时间：${moment().format('YYYY-MM-DD HH:mm')}`} />
              </List.Item>
              <List.Item>
                <Badge status="default" text={`角色：${isAdmin ? '管理员' : isTeacher ? '教师' : '学生'}`} />
              </List.Item>
            </List>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;