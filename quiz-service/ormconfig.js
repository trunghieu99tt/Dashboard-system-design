module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : null,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  charset: process.env.DB_CHARSET,
  entities: [
    __dirname + '/src/**/**/*.entity{.ts,.js}',
    __dirname + '/src/**/*.entity{.ts,.js}',
  ],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  migrationsRun: false,
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'migrations',
  },
  timezone: 'Z',
  synchronize: false,
};
