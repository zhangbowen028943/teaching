// ==================== 基础类型 ====================

/** 用户角色 */
export type UserRole = 'admin' | 'teacher' | 'student';

/** 课程状态 */
export type CourseStatus = 'active' | 'inactive';

/** 作业状态 */
export type AssignmentStatus = 'draft' | 'published' | 'closed';

/** 提交状态 */
export type SubmissionStatus = 'submitted' | 'graded' | 'late';

// ==================== 实体类型 ====================

/** 用户 */
export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  bio: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 课程时间安排 */
export interface CourseSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom: string;
}

/** 课程 */
export interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  teacher: User | string;
  students: User[] | string[];
  schedule: CourseSchedule;
  credits: number;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
}

/** 作业 */
export interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: Course | string;
  teacher: User | string;
  deadline: string;
  totalScore: number;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

/** 提交附件 */
export interface SubmissionAttachment {
  filename: string;
  originalName: string;
  path: string;
  size: number;
}

/** 提交 */
export interface Submission {
  _id: string;
  assignment: Assignment | string;
  student: User | string;
  course: Course | string;
  content: string;
  attachments: SubmissionAttachment[];
  score: number | null;
  feedback: string;
  submittedAt: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

/** 资源文件 */
export interface ResourceFile {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
}

/** 资源 */
export interface Resource {
  _id: string;
  title: string;
  description: string;
  course: Course | string;
  uploadedBy: User | string;
  file: ResourceFile;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== 通用响应类型 ====================

/** 分页信息 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

/** 分页结果 */
export interface PaginationResult<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
}

/** API 通用响应 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  error?: string;
}

// ==================== 请求类型 ====================

/** 登录凭证 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** 注册数据 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

/** 登录响应 */
export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}