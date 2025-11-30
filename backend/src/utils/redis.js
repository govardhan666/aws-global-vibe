/**
 * Redis connection utility
 */

import { logger } from './logger.js';

let redisClient = null;

export async function initRedis() {
  try {
    // Simulated Redis connection
    // In production, use ioredis
    redisClient = {
      connected: true,
      url: process.env.REDIS_URL
    };
    logger.info('Redis connection established');
    return redisClient;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
}

export function getRedis() {
  return redisClient;
}
