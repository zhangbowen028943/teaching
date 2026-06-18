/**
 * 分页中间件
 * 从 req.query 读取分页参数，注入 req.pagination 和 res.paginate 方法
 */
const paginate = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const sort = req.query.sort || '-createdAt';
  const search = req.query.search || '';
  const searchFields = req.query.searchFields
    ? req.query.searchFields.split(',')
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
   * @param {Array} data - 数据列表
   * @param {Number} total - 总记录数
   * @returns {Object} 标准分页响应
   */
  res.paginate = (data, total) => {
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

module.exports = paginate;