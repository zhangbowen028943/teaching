import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import useAuth from './hooks/useAuth';

// 组件
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';

// 页面
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Resources from './pages/Resources';
import Assignments from './pages/Assignments';
import Profile from './pages/Profile';
import Schedule from './pages/Schedule';
import Login from './pages/Login';
import Register from './pages/Register';

const { Content } = Layout;

const AppLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Layout>
        <Sidebar />
        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280, borderRadius: 8 }}>
            <Routes>
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/courses/*" element={<PrivateRoute><Courses /></PrivateRoute>} />
              <Route path="/students" element={<PrivateRoute roles={['admin']}><Students /></PrivateRoute>} />
              <Route path="/teachers" element={<PrivateRoute roles={['admin']}><Teachers /></PrivateRoute>} />
              <Route path="/resources" element={<PrivateRoute><Resources /></PrivateRoute>} />
              <Route path="/assignments" element={<PrivateRoute><Assignments /></PrivateRoute>} />
              <Route path="/schedule" element={<PrivateRoute><Schedule /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/register" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

const App = () => (
  <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1890ff' } }}>
    <Router>
      <AppLayout />
    </Router>
  </ConfigProvider>
);

export default App;