import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from 'src/shared/redis/redis.service';
import { QuizRepository } from '../quiz/quiz.repository';
import { QuizStatus } from '../quiz/quiz.enum';
import {
  LEADER_BOARD_CONST,
  QUIZ_BATCH_SIZE,
} from './constants/leaderboard.const';
import { LeaderBoardService } from './leaderboard.service';

@Injectable()
export class InitLeaderBoardService implements OnModuleInit {
  private INIT_LEADER_BOARD_KEY = 'INIT_LEADER_BOARD_KEY';
  constructor(
    private readonly redisService: RedisService,
    private readonly quizRepository: QuizRepository,
    private readonly leaderBoardService: LeaderBoardService,
  ) {}
  onModuleInit() {
    this.initLeaderBoards();
  }

  async initLeaderBoards() {
    console.log('Start init leaderboard');
    const canRun = await this.redisService.tryLock(this.INIT_LEADER_BOARD_KEY);

    if (canRun) {
      try {
        const numberOfOnGoingQuiz = await this.quizRepository.count({
          where: {
            status: QuizStatus.ONGOING,
          },
        });

        console.log('numberOfOnGoingQuiz', numberOfOnGoingQuiz);

        for (
          let page = 0;
          page < Math.ceil((numberOfOnGoingQuiz * 1.0) / QUIZ_BATCH_SIZE);
          page += 1
        ) {
          const quizIdsNotHavingLeaderBoardInRedisYet =
            await this.getQuizIdsNotHavingLeaderBoardStoredInRedisInPage(page);
          for (const quizId of quizIdsNotHavingLeaderBoardInRedisYet) {
            await this.leaderBoardService.populateUserScoreInQuiz(quizId);
          }
        }
      } catch (error) {
        console.error('Error when initializing leader-board', error);
      } finally {
        await this.redisService.del([this.INIT_LEADER_BOARD_KEY]);
      }
    }

    console.log('Done init leader-board');
  }

  private async getQuizIdsNotHavingLeaderBoardStoredInRedisInPage(
    page: number,
  ): Promise<number[]> {
    const start = page * QUIZ_BATCH_SIZE;
    const quiz = await this.quizRepository.find({
      where: {
        status: QuizStatus.ONGOING,
      },
      skip: start,
      take: QUIZ_BATCH_SIZE,
      select: ['id'],
    });

    const quizIds = quiz.map((quiz) => quiz.id);

    const quizLeaderBoardInRedis = await Promise.all(
      quizIds.map(async (quizId) => {
        return {
          quizId,
          existingInRedis: await this.redisService.exists(
            `${LEADER_BOARD_CONST.LEADER_BOARD_PREFIX}_${quizId}`,
          ),
        };
      }),
    );

    return quizLeaderBoardInRedis
      .filter((res) => !res.existingInRedis)
      .map((res) => res.quizId);
  }
}
