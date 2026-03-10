const config = {
  development: {
    API_URL: 'http://localhost:5002',
    BASE_URL: 'http://localhost:5002'
  },
  production: {
    API_URL: process.env.REACT_APP_API_URL || 'https://your-domain.com',
    BASE_URL: process.env.REACT_APP_BASE_URL || 'https://your-domain.com'
  }
};

const environment = process.env.NODE_ENV || 'development';

export default config[environment];