const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const authController = require('../controllers/authController')
const { auth } = require('../middleware/auth')
const validate = require('../middleware/validate')

const registerValidation = [
  body('username').trim().isLength({ min: 2 }).withMessage('用户名至少2个字符'),
  body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6个字符'),
]

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱'),
  body('password').notEmpty().withMessage('请输入密码'),
]

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, teacher, student]
 *         avatar:
 *           type: string
 *         phone:
 *           type: string
 *         bio:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *             user:
 *               $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [认证]
 *     summary: 用户注册
 *     description: 注册新用户，默认角色为 student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密码（至少6个字符）
 *               role:
 *                 type: string
 *                 enum: [admin, teacher, student]
 *                 description: 角色（仅管理员可指定）
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: 该邮箱已被注册
 */
router.post('/register', registerValidation, validate, authController.register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [认证]
 *     summary: 用户登录
 *     description: 使用邮箱和密码登录，返回 JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密码
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: 邮箱或密码错误
 */
router.post('/login', loginValidation, validate, authController.login)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [认证]
 *     summary: 获取当前用户信息
 *     description: 获取当前登录用户的详细信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 未登录或令牌过期
 */
router.get('/me', auth, authController.getMe)

module.exports = router