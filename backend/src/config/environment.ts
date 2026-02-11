import dotenv from 'dotenv';

dotenv.config();

interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  apiBaseUrl: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiration: string;
  coinGeckoApiUrl: string;
  coinGeckoApiKey: string;
  corsOrigin: string[]; // <--- change from string to string[]
  adminEmail: string;
  adminPassword: string;
}


const getEnvironmentConfig = (): EnvironmentConfig => {
  const {
    NODE_ENV = 'development',
    PORT = '5000',
    API_BASE_URL = 'http://localhost:5000',
    DATABASE_URL,
    JWT_SECRET,
    JWT_EXPIRATION = '7d',
    COINGECKO_API_URL = 'https://api.coingecko.com/api/v3',
    COINGECKO_API_KEY = '',
    CORS_ORIGIN = 'http://localhost:3000,https://admin.bitorynfx.com',
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
  } = process.env;

  if (!DATABASE_URL) throw new Error('DATABASE_URL environment variable is not set');
  if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');

  // Split comma-separated string into array
  const allowedOrigins = CORS_ORIGIN.split(',');

  return {
    nodeEnv: NODE_ENV,
    port: parseInt(PORT, 10),
    apiBaseUrl: API_BASE_URL,
    databaseUrl: DATABASE_URL,
    jwtSecret: JWT_SECRET,
    jwtExpiration: JWT_EXPIRATION,
    coinGeckoApiUrl: COINGECKO_API_URL,
    coinGeckoApiKey: COINGECKO_API_KEY,
    corsOrigin: allowedOrigins,
    adminEmail: ADMIN_EMAIL || 'admin@crypto.local',
    adminPassword: ADMIN_PASSWORD || 'admin123456',
  };
};


export const config = getEnvironmentConfig();
