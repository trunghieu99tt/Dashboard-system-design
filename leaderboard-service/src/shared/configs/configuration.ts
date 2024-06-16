export default (): any => ({
  env: process.env.APP_ENV,
  port: process.env.APP_PORT,
  apiKey: process.env.API_KEY,
  isDev: process.env.APP_ENV === 'development',
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  },
  health: {
    api: {
      url: process.env.HEALTH_API_URL,
    },
  },
});
