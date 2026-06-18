import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';

import connectDB from './config/db';
import logger from './config/logger';
import swaggerSpec from './config/swagger';
import errorHandler from './middleware/errorHandler';
import paginate from './middleware/paginate';
import seedData from './utils/seed';

// 路由导入
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import courseRoutes from './routes/courseRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import resourceRoutes from './routes/resourceRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

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
app.get('/health', (req: Request, res: Response) => {
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
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
  });
});

// 统一错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  await connectDB();
  await seedData();

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

startServer();

export default app;