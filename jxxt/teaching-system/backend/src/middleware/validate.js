const { validationResult } = require('express-validator')

/**
 * 通用验证中间件
 * 包装 express-validator 的 validationResult
 * 统一返回格式化的验证错误
 */
const validate = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }))

    return res.status(400).json({
      success: false,
      message: '请求参数验证失败',
      errors: formattedErrors,
    })
  }

  next()
}

module.exports = validate