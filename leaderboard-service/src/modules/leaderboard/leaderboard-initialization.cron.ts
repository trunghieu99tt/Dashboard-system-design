import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { RedisService } from 'src/shared/redis/redis.service';
import {
  INITIALIZING_LEADER_BOARD_PREFIX,
  WAITING_FOR_INIT_LEADER_BOARD_QUEUE,
  WAITING_FOR_INIT_LEADER_BOARD_QUEUE_LOCK,
} from './constants/leaderboard.const';
import { LeaderBoardService } from './leaderboard.service';

@Injectable()
export class LeaderBoardInitializationCron {
  constructor(
    private readonly redisService: RedisService,
    private readonly leaderBoardService: LeaderBoardService,
  ) {}

  @Interval(5000)
  async initMissingLeaderBoard() {
    const canRun = await this.redisService.tryLock(
      WAITING_FOR_INIT_LEADER_BOARD_QUEUE_LOCK,
    );
    if (!canRun) {
      return;
    }

    const missingLeaderBoardQuizId = parseInt(
      await this.redisService.popFirstElementFromSortedSet(
        WAITING_FOR_INIT_LEADER_BOARD_QUEUE,
      ),
    );

    try {
      if (missingLeaderBoardQuizId) {
        console.log(
          `Processing initialization for ${missingLeaderBoardQuizId}`,
        );
        await this.redisService.tryLock(
          `${INITIALIZING_LEADER_BOARD_PREFIX}_${missingLeaderBoardQuizId}`,
        );
        await this.leaderBoardService.populateUserScoreInQuiz(
          missingLeaderBoardQuizId,
        );
      }
    } catch (error) {
      console.error('Error when initializing leader-board', error);
    } finally {
      await this.redisService.del([
        WAITING_FOR_INIT_LEADER_BOARD_QUEUE_LOCK,
        `${INITIALIZING_LEADER_BOARD_PREFIX}_${missingLeaderBoardQuizId}`,
      ]);
    }
  }
}
