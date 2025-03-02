import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// 导入组件
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Resources from './pages/Resources';
import Assignments from './pages/Assignments';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

const { Header, Content, Sider } = Layout;

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ padding: 0, background: '#fff' }}>
            <Navbar />
          </Header>
          <Layout>
            <Sider width={200} style={{ background: '#fff' }}>
              <Sidebar />
            </Sider>
            <Layout style={{ padding: '24px' }}>
              <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/courses/*" element={<Courses />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/teachers" element={<Teachers />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App; 