import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Cluster } from 'ioredis';

@Injectable()
export class RedisService {
  redis: Redis | Cluster;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(
      configService.get<number>('redis.port'),
      configService.get<string>('redis.host'),
      {
        password: configService.get<string>('redis.password'),
      },
    );
  }

  async get(key: string): Promise<string> {
    const isRedisUp = await this.checkRedis();
    if (!isRedisUp) {
      return null;
    }
    return new Promise((resolve, reject) => {
      this.redis.get(key, function (err, result) {
        if (err) {
          reject(err);
        }

        // reply is null when the key is missing
        resolve(result);
      });
    });
  }

  async set(key: string, value: string): Promise<string> {
    const isRedisUp = await this.checkRedis();
    if (!isRedisUp) {
      return;
    }
    return new Promise((resolve, reject) => {
      this.redis.set(key, value, function (err, result) {
        if (err) {
          reject(err);
        }
        // reply is null when the key is missing
        resolve(result);
      });
    });
  }

  async del(key: string): Promise<number> {
    const isRedisUp = await this.checkRedis();
    if (!isRedisUp) {
      return 0;
    }
    return new Promise((resolve, reject) => {
      this.redis.del(key, function (err, result) {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }

  async tryLock(key: string): Promise<number> {
    const isRedisUp = await this.checkRedis();
    if (!isRedisUp) {
      return 0;
    }
    return new Promise((resolve, reject) => {
      this.redis.setnx(key, 1, function (err, result) {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }

  private async checkRedis() {
    try {
      const result = await this.redis.ping();
      if (result === 'PONG') {
        return true;
      } else {
        console.log('Unexpected response from Redis:', result);
        return false;
      }
    } catch (error) {
      console.error('Error connecting to Redis:', error);
      return false;
    }
  }
}
