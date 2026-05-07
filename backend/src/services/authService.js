const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const isAdminIdentity = ({ username = '', email = '' }) => {
    const local = String(email).split('@')[0] || '';
    const domain = String(email).split('@')[1] || '';
    const name = String(username).toLowerCase();

    return (
        local.toLowerCase() === 'admin' ||
        name === 'admin' ||
        name === '@admin' ||
        domain.toLowerCase() === 'admin.com'
    );
};

const createJwtToken = (user) => {
    const jwtSecret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (!jwtSecret) {
        const err = new Error('JWT secret is not configured');
        err.statusCode = 500;
        throw err;
    }

    return jwt.sign({
            sub: user._id.toString(),
            role: user.role,
            email: user.email,
        },
        jwtSecret, { expiresIn }
    );
};

const registerUser = async({ username, email, password }) => {
    const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    }).lean();

    if (existingUser) {
        const err = new Error('Username or email already exists');
        err.statusCode = 409;
        throw err;
    }

    const user = await User.create({
        username,
        email,
        password,
        role: isAdminIdentity({ username, email }) ? 'admin' : 'user',
    });

    const token = createJwtToken(user);

    return {
        user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

const loginUser = async({ email, password }) => {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }

    if (!user.active || user.accountStatus !== 'active') {
        const err = new Error('Account is not active');
        err.statusCode = 403;
        throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }

    const token = createJwtToken(user);

    return {
        user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

module.exports = {
    registerUser,
    loginUser,
};