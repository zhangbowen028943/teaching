import React from 'react';
import { Row, Col, Card, Statistic, List, Calendar, Badge } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const Dashboard = () => {
  // 模拟数据
  const statistics = {
    studentCount: 256,
    courseCount: 48,
    assignmentCount: 15,
    resourceCount: 89
  };

  const recentActivities = [
    { type: 'course', title: '新课程：高等数学', time: '2小时前' },
    { type: 'assignment', title: '作业截止：Python编程基础', time: '4小时前' },
    { type: 'resource', title: '上传了课件：数据结构导论', time: '1天前' },
    { type: 'notice', title: '系统更新通知', time: '2天前' }
  ];

  const upcomingEvents = [
    { type: 'success', content: '高等数学课程' },
    { type: 'warning', content: '作业截止：数据结构' },
    { type: 'error', content: '期中考试：计算机网络' }
  ];

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总学生数"
              value={statistics.studentCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总课程数"
              value={statistics.courseCount}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待批作业"
              value={statistics.assignmentCount}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="教学资源"
              value={statistics.resourceCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={16}>
          <Card title="近期活动">
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="待办事项">
            <Calendar
              fullscreen={false}
              dateCellRender={(date) => {
                const events = upcomingEvents.filter(event =>
                  date.date() === new Date().getDate()
                );
                return (
                  <ul className="events">
                    {events.map((event, index) => (
                      <li key={index}>
                        <Badge status={event.type} text={event.content} />
                      </li>
                    ))}
                  </ul>
                );
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 