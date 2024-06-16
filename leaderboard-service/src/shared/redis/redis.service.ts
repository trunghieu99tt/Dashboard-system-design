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

  async del(keys: string[]): Promise<number> {
    const isRedisUp = await this.checkRedis();
    if (!isRedisUp) {
      return;
    }
    return new Promise((resolve, reject) => {
      this.redis.del(keys, function (err, result) {
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

  async exists(key: string): Promise<number> {
    const isRedisUp = await this.checkRedis();
    if (!isRedisUp) {
      return 0;
    }
    return new Promise((resolve, reject) => {
      this.redis.exists(key, function (err, result) {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }

  async getFromSortedSet(setName: string, start: number, stop: number) {
    const isRedisUp = await this.checkRedis();
    if (!isRedisUp) {
      return [];
    }
    return this.redis.zrevrange(setName, start, stop, 'WITHSCORES');
  }

  async incScoreOfElementInSortedSet(
    setName: string,
    element: string | number,
    score: number,
  ) {
    const isRedisUp = await this.checkRedis();
    if (!isRedisUp) {
      return;
    }
    return this.redis.zincrby(setName, score, element);
  }

  async getSortedSetSize(setName: string) {
    const isRedisUp = await this.checkRedis();
    if (!isRedisUp) {
      return 0;
    }
    return this.redis.zcard(setName);
  }

  async isMemberInSortedSet(setName: string, element: string | number) {
    const isRedisUp = await this.checkRedis();
    if (!isRedisUp) {
      return false;
    }
    const elementScore = await this.redis.zscore(setName, element);
    return !!elementScore;
  }

  async popFirstElementFromSortedSet(setName: string) {
    const isRedisUp = await this.checkRedis();
    if (!isRedisUp) {
      return null;
    }
    const firstElement = await this.redis.zrange(setName, 0, 0);

    if (firstElement.length > 0) {
      await this.redis.zrem(setName, firstElement[0]);
      return firstElement[0];
    } else {
      return null;
    }
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
