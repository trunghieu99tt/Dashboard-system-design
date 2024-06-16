import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import {
  JOB_OPTIONS,
  QUEUE_JOB,
  QUEUE_NAME,
} from 'src/shared/constants/queue.const';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { In } from 'typeorm';
import { UserScoreEventRepository } from './user-score-event.repository';
import { UserScoreEventStatus } from './user-score-event.enum';
import { RedisService } from 'src/shared/redis/redis.service';

@Injectable()
export class UserScoreEventCron {
  private USER_SCORE_EVENT_RUN_LOCK = 'USER_SCORE_EVENT_RUN_LOCK';
  constructor(
    private readonly userScoreEventRepository: UserScoreEventRepository,
    @InjectQueue(QUEUE_NAME.USER_SCORE_EVENT)
    private readonly quizScoreEventQueue: Queue,
    private readonly redisService: RedisService,
  ) {}

  @Interval(5000)
  async syncUserQuizScore() {
    const canRun = this.redisService.tryLock(this.USER_SCORE_EVENT_RUN_LOCK);
    if (!canRun) {
      return;
    }

    try {
      const unprocessedEvents = await this.userScoreEventRepository.find({
        where: {
          status: UserScoreEventStatus.UNPROCESSED,
        },
        take: 100,
      });
      const newEvents = unprocessedEvents.map((event) => ({
        name: QUEUE_JOB.UPDATE_SCORE,
        data: {
          userId: event.userId,
          quizId: event.quizId,
          type: event.eventType,
          score: event.score,
        },
        opts: {
          jobId: event.id,
          ...JOB_OPTIONS,
        },
      }));
      await this.quizScoreEventQueue.addBulk(newEvents);
      const updatedEventIds = unprocessedEvents.map((event) => event.id);
      await this.userScoreEventRepository.update(
        {
          id: In(updatedEventIds),
        },
        {
          status: UserScoreEventStatus.PROCESSED,
        },
      );
    } catch (ex) {
      console.error('Error occurs QuizScoreEventCron::syncUserQuizScore ', ex);
    } finally {
      await this.redisService.del(this.USER_SCORE_EVENT_RUN_LOCK);
    }
  }
}
