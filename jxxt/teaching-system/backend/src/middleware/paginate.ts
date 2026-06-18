import { Request, Response, NextFunction } from 'express';
import { PaginationParams } from '../types';

/**
 * 分页中间件
 * 从 req.query 读取分页参数，注入 req.pagination 和 res.paginate 方法
 */
const paginate = (req: Request, res: Response, next: NextFunction): void => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 10));
  const skip = (page - 1) * limit;
  const sort = (req.query.sort as string) || '-createdAt';
  const search = (req.query.search as string) || '';
  const searchFields = req.query.searchFields
    ? (req.query.searchFields as string).split(',')
    : [];

  req.pagination = {
    page,
    limit,
    skip,
    sort,
    search,
    searchFields,
  };

  /**
   * 统一分页响应方法
   * @param data - 数据列表
   * @param total - 总记录数
   */
  res.paginate = (data: any[], total: number): void => {
    const pages = Math.ceil(total / limit);
    const hasMore = page < pages;

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasMore,
      },
    });
  };

  next();
};

export default paginate;