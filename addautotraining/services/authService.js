const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const HttpError = require('../utils/httpError');
const AuthServiceInterface = require('./interfaces/authServiceInterface');

class AuthService extends AuthServiceInterface {
  async register({ name, email, password }) {

    let user = await User.findOne({ email });

    if (user) {
      throw new HttpError(400, 'User already exists');
    }

    user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user.id);
    return { token, user: this.sanitizeUser(user) };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new HttpError(400, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new HttpError(400, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new HttpError(400, 'Account is deactivated');
    }

    const token = generateToken(user.id);
    return { token, user: this.sanitizeUser(user) };
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    return user;
  }

  sanitizeUser(user) {
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }
}

module.exports = new AuthService();
