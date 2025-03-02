# 教学管理系统

一个现代化的教学管理系统，基于 React + Node.js + MongoDB 构建。

## 功能特点

- 🚀 现代化的用户界面设计
- 📚 课程管理（创建、编辑、删除课程）
- 👥 用户管理（学生、教师、管理员）
- 📝 作业管理（发布、提交、评分）
- 📊 数据统计和可视化
- 📅 课程表管理
- 📁 教学资源管理
- 🔐 完整的权限控制系统

## 技术栈

### 前端
- React 18
- Ant Design 5.x
- React Router 6
- Axios
- Redux Toolkit

### 后端
- Node.js
- Express
- MongoDB
- JWT 认证
- Mongoose

## 快速开始

### 系统要求
- Node.js 14.0 或以上
- MongoDB 4.0 或以上
- npm 或 yarn

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/yourusername/teaching-system.git
cd teaching-system
```

2. 安装依赖
```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

3. 配置环境变量
```bash
# 后端配置 (backend/.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/teaching-system
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# 前端配置 (frontend/.env)
REACT_APP_API_URL=http://localhost:5000/api
```

4. 启动系统

Windows 用户：
```bash
# 在项目根目录下运行
start.bat
```

Linux/Mac 用户：
```bash
# 在项目根目录下运行
chmod +x start.sh
./start.sh
```

5. 访问系统
- 前端界面：http://localhost:3000
- 后端API：http://localhost:5000

## 系统角色

### 管理员
- 用户管理（创建、编辑、删除用户）
- 课程管理
- 系统设置
- 数据统计

### 教师
- 课程管理（创建、编辑自己的课程）
- 作业管理（发布、评分）
- 学生管理（查看选课学生）
- 资源管理（上传、管理教学资源）

### 学生
- 课程查看和选课
- 作业提交
- 资源下载
- 个人信息管理

## 项目结构

```
teaching-system/
├── frontend/                # 前端项目
│   ├── public/             # 静态资源
│   ├── src/               
│   │   ├── components/     # 组件
│   │   ├── pages/         # 页面
│   │   ├── services/      # API服务
│   │   └── utils/         # 工具函数
│   └── package.json
│
├── backend/                # 后端项目
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── middleware/    # 中间件
│   │   └── app.js         # 入口文件
│   └── package.json
│
├── start.bat              # Windows启动脚本
├── start.sh              # Linux/Mac启动脚本
└── README.md
```

## API 文档

API 文档使用 Swagger 生成，启动后端服务后访问：
http://localhost:5000/api-docs

## 开发指南

1. 代码规范
- 使用 ESLint 进行代码检查
- 遵循 Airbnb JavaScript 风格指南
- 使用 Prettier 进行代码格式化

2. 提交规范
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 测试账号

- 管理员：admin@example.com / admin123
- 教师：teacher@example.com / teacher123
- 学生：student@example.com / student123

## 常见问题

1. MongoDB 连接失败
- 确保 MongoDB 服务已启动
- 检查数据库连接字符串是否正确

2. 端口占用
- 修改 .env 文件中的端口配置
- 检查并关闭占用端口的程序

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- 项目维护者：[您的姓名]
- 邮箱：[您的邮箱]
- 项目主页：[项目GitHub地址]

## 致谢

感谢所有为这个项目做出贡献的开发者！



