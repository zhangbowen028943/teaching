import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ==================== 模型接口 ====================

/** 用户角色 */
export type UserRole = 'admin' | 'teacher' | 'student';

/** 课程状态 */
export type CourseStatus = 'active' | 'inactive';

/** 作业状态 */
export type AssignmentStatus = 'draft' | 'published' | 'closed';

/** 提交状态 */
export type SubmissionStatus = 'submitted' | 'graded' | 'late';

/** 用户接口 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
  phone: string;
  bio: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/** 课程时间安排 */
export interface ICourseSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom: string;
}

/** 课程接口 */
export interface ICourse extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  description: string;
  teacher: Types.ObjectId | IUser;
  students: Types.ObjectId[] | IUser[];
  schedule: ICourseSchedule;
  credits: number;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** 作业接口 */
export interface IAssignment extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  course: Types.ObjectId | ICourse;
  teacher: Types.ObjectId | IUser;
  deadline: Date;
  totalScore: number;
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** 提交附件 */
export interface ISubmissionAttachment {
  filename: string;
  originalName: string;
  path: string;
  size: number;
}

/** 提交接口 */
export interface ISubmission extends Document {
  _id: Types.ObjectId;
  assignment: Types.ObjectId | IAssignment;
  student: Types.ObjectId | IUser;
  course: Types.ObjectId | ICourse;
  content: string;
  attachments: ISubmissionAttachment[];
  score: number | null;
  feedback: string;
  submittedAt: Date;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** 资源文件 */
export interface IResourceFile {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
}

/** 资源接口 */
export interface IResource extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  course: Types.ObjectId | ICourse;
  uploadedBy: Types.ObjectId | IUser;
  file: IResourceFile;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 通用接口 ====================

/** 分页参数 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sort: string;
  search: string;
  searchFields: string[];
}

/** JWT 负载 */
export interface JwtPayload {
  id: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/** 种子数据 */
export interface SeedData {
  admin: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
  };
  teacher: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
  };
  student: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
  };
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

// ==================== Express 扩展 ====================

/** 扩展 Express Request */
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      pagination?: PaginationParams;
    }
  }
}

/** Response 扩展: paginate 方法 */
declare global {
  namespace Express {
    interface Response {
      paginate<T>(data: T[], total: number): void;
    }
  }
}