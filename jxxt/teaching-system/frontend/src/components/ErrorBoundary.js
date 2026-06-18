import React from 'react'
import { Result, Button } from 'antd'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    // 可将错误上报到监控服务
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // 可自定义 fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
            padding: 24,
          }}
        >
          <Result
            status="error"
            title="页面渲染异常"
            subTitle="很抱歉，页面发生了一些错误。请尝试刷新或返回首页。"
            extra={[
              <Button type="primary" key="retry" onClick={this.handleRetry}>
                重试
              </Button>,
              <Button
                key="home"
                onClick={() => {
                  window.location.href = '/'
                }}
              >
                返回首页
              </Button>,
            ]}
          />
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary