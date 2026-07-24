import { Router } from 'express';
import { signupHandler, loginHandler, logoutHandler } from '@controllers/auth.controller';

const router = Router();

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Register a new employee
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, salary]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tejas Kulkarni
 *               email:
 *                 type: string
 *                 example: tejas@company.com
 *               password:
 *                 type: string
 *                 example: Test@1234
 *               salary:
 *                 type: number
 *                 example: 85000
 *               department:
 *                 type: string
 *                 example: Engineering
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       409:
 *         description: Email already registered
 */
router.post('/signup', signupHandler);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in and receive an access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: tejas@company.com
 *               password:
 *                 type: string
 *                 example: Test@1234
 *     responses:
 *       200:
 *         description: Login successful, returns accessToken and sets refreshToken cookie
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginHandler);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out and revoke the refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logoutHandler);

export default router;
