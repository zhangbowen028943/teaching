const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const logger = require('./config/logger');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const paginate = require('./middleware/paginate');
const seedData = require('./utils/seed');

// 路由导入
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// 加载环境变量
dotenv.config();

const app = express();

// 安全头
app.use(helmet());

// 响应压缩
app.use(compression());

// 全局速率限制：15 分钟 100 次
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
  },
});

// 认证路由速率限制：15 分钟 10 次
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '登录尝试过于频繁，请 15 分钟后再试',
  },
});

// 全局速率限制
app.use(globalLimiter);

// 分页中间件
app.use(paginate);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// 路由
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
  });
});

// 统一错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedData();

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

startServer();