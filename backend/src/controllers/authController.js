const { registerUser, loginUser } = require('../services/authService');

const register = async (req, res) => {
  const result = await registerUser(req.body);

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: result,
  });
};

const login = async (req, res) => {
  const result = await loginUser(req.body);

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: result,
  });
};

const getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

module.exports = {
  register,
  login,
  getMe,
};
