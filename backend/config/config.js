require('dotenv').config(); // ← This line is required to load environment variables

// Set default JWT secret if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
}

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'chandu',
    database: process.env.DB_NAME || 'libraryhub',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'chandu',
    database: process.env.DB_NAME || 'libraryhub',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'chandu',
    database: process.env.DB_NAME || 'libraryhub',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }
};
