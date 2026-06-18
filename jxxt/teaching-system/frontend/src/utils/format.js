import moment from 'moment'

/**
 * 日期格式化
 * @param {string|Date} date - 日期值
 * @param {string} format - 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '--'
  return moment(date).format(format)
}

/**
 * 文件大小格式化
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0 || bytes == null) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = (bytes / Math.pow(k, i)).toFixed(2)
  return `${size} ${units[i]}`
}

/**
 * 角色中文化
 * @param {string} role - 角色标识
 * @returns {string} 中文角色名
 */
export const formatRole = (role) => {
  const roleMap = {
    admin: '管理员',
    teacher: '教师',
    student: '学生',
  }
  return roleMap[role] || role || '未知'
}

/**
 * 状态颜色映射
 * @param {string} status - 状态标识
 * @returns {string} 颜色值
 */
export const getStatusColor = (status) => {
  const colorMap = {
    active: 'green',
    pending: 'orange',
    inactive: 'red',
    draft: 'default',
    published: 'blue',
    submitted: 'purple',
    graded: 'cyan',
    overdue: 'red',
    completed: 'green',
    in_progress: 'processing',
    cancelled: 'default',
  }
  return colorMap[status] || 'default'
}

/**
 * 文本截断
 * @param {string} str - 原始字符串
 * @param {number} length - 最大长度，默认 50
 * @returns {string} 截断后的字符串
 */
export const truncate = (str, length = 50) => {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}