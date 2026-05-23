class AuthServiceInterface {
  async register() {
    throw new Error('register must be implemented');
  }

  async login() {
    throw new Error('login must be implemented');
  }

  async getCurrentUser() {
    throw new Error('getCurrentUser must be implemented');
  }
}

module.exports = AuthServiceInterface;
