import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Layout, Spin } from 'antd'
import { ThemeProvider } from './context/ThemeContext'
import { useThemeContext } from './context/ThemeContext'
import useAuth from './hooks/useAuth'

// 组件
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import PrivateRoute from './components/PrivateRoute'
import BreadcrumbNav from './components/BreadcrumbNav'
import ErrorBoundary from './components/ErrorBoundary'

// 页面
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import Students from './pages/Students'
import Teachers from './pages/Teachers'
import Resources from './pages/Resources'
import Assignments from './pages/Assignments'
import Profile from './pages/Profile'
import Schedule from './pages/Schedule'
import Login from './pages/Login'
import Register from './pages/Register'

const { Content } = Layout

// 页面切换加载组件
const PageLoading = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 300,
    }}
  >
    <Spin size="large" tip="加载中..." />
  </div>
)

// 带 Loading 的路由包裹组件
const RouteWithLoading = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [location.pathname])

  if (loading) {
    return <PageLoading />
  }

  return children
}

const AppLayout = () => {
  const { isAuthenticated } = useAuth()
  const { isDark } = useThemeContext()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Layout>
        <Sidebar />
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: isDark ? '#141414' : '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
              borderRadius: 8,
            }}
          >
            <BreadcrumbNav />
            <ErrorBoundary>
              <RouteWithLoading>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/courses/*"
                    element={
                      <PrivateRoute>
                        <Courses />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/students"
                    element={
                      <PrivateRoute roles={['admin']}>
                        <Students />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/teachers"
                    element={
                      <PrivateRoute roles={['admin']}>
                        <Teachers />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/resources"
                    element={
                      <PrivateRoute>
                        <Resources />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/assignments"
                    element={
                      <PrivateRoute>
                        <Assignments />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/schedule"
                    element={
                      <PrivateRoute>
                        <Schedule />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/login" element={<Navigate to="/" replace />} />
                  <Route path="/register" element={<Navigate to="/" replace />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </RouteWithLoading>
            </ErrorBoundary>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

const App = () => (
  <ThemeProvider>
    <Router>
      <AppLayout />
    </Router>
  </ThemeProvider>
)

export default App