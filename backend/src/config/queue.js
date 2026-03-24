const { Queue } = require('bullmq');

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

// Parse Redis URL if provided
if (process.env.REDIS_URL) {
  const url = new URL(process.env.REDIS_URL);
  redisConnection.host = url.hostname;
  redisConnection.port = parseInt(url.port);
}

const contentQueue = new Queue('content-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
});

module.exports = { contentQueue, redisConnection };
