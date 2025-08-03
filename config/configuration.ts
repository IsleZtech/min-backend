export default () => ({
  DOCKER_TEST: process.env.DOCKER_TEST,
  JWT_SECRET_KEY: "abc",
  MONGO_DB_CONNECTION: process.env.MONGO_DB_CONNECTION,
  MONGO_DB_CONNECTION_TEST: process.env.MONGO_DB_CONNECTION_TEST,
  NODE_ENV: process.env.NODE_ENV,
  PORT: parseInt(process.env.PORT, 10),
});
