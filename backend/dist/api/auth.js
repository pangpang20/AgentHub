"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../utils/auth");
const database_1 = __importDefault(require("../config/database"));
const error_1 = require("../middleware/error");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Register
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            throw new error_1.AppError('Email, password, and name are required', 400, 'MISSING_FIELDS');
        }
        // Check if user already exists
        const existingUser = await database_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new error_1.AppError('User already exists', 409, 'USER_EXISTS');
        }
        // Hash password
        const passwordHash = await (0, auth_1.hashPassword)(password);
        // Create user
        const user = await database_1.default.user.create({
            data: {
                email,
                passwordHash,
                name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                isEmailVerified: true,
                createdAt: true,
            },
        });
        // Generate tokens
        const token = (0, auth_1.generateToken)({ id: user.id, email: user.email });
        const refreshToken = (0, auth_1.generateRefreshToken)({ id: user.id, email: user.email });
        res.status(201).json({
            user,
            token,
            refreshToken,
        });
    }
    catch (error) {
        next(error);
    }
});
// Login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new error_1.AppError('Email and password are required', 400, 'MISSING_FIELDS');
        }
        // Find user
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new error_1.AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }
        // Compare password
        const isValidPassword = await (0, auth_1.comparePassword)(password, user.passwordHash);
        if (!isValidPassword) {
            throw new error_1.AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }
        // Update last login
        await database_1.default.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        // Generate tokens
        const token = (0, auth_1.generateToken)({ id: user.id, email: user.email });
        const refreshToken = (0, auth_1.generateRefreshToken)({ id: user.id, email: user.email });
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
            },
            token,
            refreshToken,
        });
    }
    catch (error) {
        next(error);
    }
});
// Refresh token
router.post('/refresh', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new error_1.AppError('Refresh token is required', 400, 'MISSING_TOKEN');
        }
        // Verify refresh token
        const decoded = (0, auth_1.verifyToken)(refreshToken);
        // Check if user still exists
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                isEmailVerified: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new error_1.AppError('User not found', 404, 'USER_NOT_FOUND');
        }
        // Generate new tokens
        const token = (0, auth_1.generateToken)({ id: user.id, email: user.email });
        const newRefreshToken = (0, auth_1.generateRefreshToken)({ id: user.id, email: user.email });
        res.json({
            token,
            refreshToken: newRefreshToken,
        });
    }
    catch (error) {
        next(error);
    }
});
// Get current user
router.get('/me', auth_2.authenticate, async (req, res, next) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                isEmailVerified: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });
        if (!user) {
            throw new error_1.AppError('User not found', 404, 'USER_NOT_FOUND');
        }
        res.json({ user });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map