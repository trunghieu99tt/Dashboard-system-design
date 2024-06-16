import { Injectable } from '@nestjs/common';
import { GetLeaderBoardQuery } from './dto/get-leader-board-query.dto';
import { RedisService } from 'src/shared/redis/redis.service';
import {
  INITIALIZING_LEADER_BOARD_PREFIX,
  LEADER_BOARD_CONST,
  USER_SCORE_BATCH_SIZE,
  WAITING_FOR_INIT_LEADER_BOARD_QUEUE,
} from './constants/leaderboard.const';
import {
  GetLeaderBoardOutput,
  LeaderBoardItem,
} from './dto/get-leader-board-output.dto';
import { plainToClass } from 'class-transformer';
import { UserScoreRepository } from '../user-score/user-score.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class LeaderBoardService {
  constructor(
    private readonly redisService: RedisService,
    private readonly userScoreRepository: UserScoreRepository,
    private readonly userRepository: UserRepository,
  ) {}
  async getLeaderBoard(
    id: number,
    query: GetLeaderBoardQuery,
  ): Promise<{
    data: GetLeaderBoardOutput;
    meta: any;
  }> {
    const { page, pageSize } = query;

    const start = page * pageSize;
    const end = start + pageSize - 1;

    const leaderBoardKey = `${LEADER_BOARD_CONST.LEADER_BOARD_PREFIX}_${id}`;
    const isLeaderBoardInRedis = await this.redisService.exists(leaderBoardKey);

    let rank;
    let total;

    if (!isLeaderBoardInRedis) {
      this.addLeaderBoardIdToWaitingForInitializationQueue(id);
      const rankByScoreFromDb = await this.userScoreRepository.getUserRanks(
        id,
        pageSize,
        start,
      );
      rank = rankByScoreFromDb.rank;
      total = rankByScoreFromDb.total;
    } else {
      const [rankFromRedis, totalFromRedis] = await Promise.all([
        this.redisService.getFromSortedSet(leaderBoardKey, start, end),
        this.redisService.getSortedSetSize(leaderBoardKey),
      ]);
      rank = this.getUserWithScore(rankFromRedis);
      total = totalFromRedis;
    }

    const userIds = rank.map((rankItem) => rankItem.userId);
    const userInfoMap = await this.getUserInfo(userIds);
    const rankList = rank.map((rankItem) =>
      plainToClass(LeaderBoardItem, {
        userId: rankItem.userId,
        score: rankItem.score,
        name: userInfoMap[rankItem.userId]?.name,
        avatar: userInfoMap[rankItem.userId]?.avatar,
      }),
    );

    return {
      data: {
        id,
        data: rankList,
      },
      meta: {
        total,
        totalPage: Math.ceil((total * 1.0) / pageSize),
      },
    };
  }

  public async populateUserScoreInQuiz(quizId: number) {
    const numberOfUserScore = await this.userScoreRepository.count({
      where: {
        quizId,
      },
    });
    for (
      let page = 0;
      page < Math.ceil((numberOfUserScore * 1.0) / USER_SCORE_BATCH_SIZE);
      page += 1
    ) {
      const userScoreInPage = await this.userScoreRepository.find({
        where: {
          quizId,
        },
        select: ['userId', 'score'],
      });
      await Promise.all(
        userScoreInPage.map(async (userScore) => {
          const key = `${LEADER_BOARD_CONST.LEADER_BOARD_PREFIX}_${quizId}`;
          await this.redisService.incScoreOfElementInSortedSet(
            key,
            userScore.userId,
            userScore.score,
          );
        }),
      );
    }
  }

  private async addLeaderBoardIdToWaitingForInitializationQueue(id: number) {
    const isCurrentWaitingForInitializationLeaderBoard =
      await this.redisService.isMemberInSortedSet(
        WAITING_FOR_INIT_LEADER_BOARD_QUEUE,
        id,
      );
    const isCUrrentProcessingInitializationLeaderBoard =
      await this.redisService.exists(
        `${INITIALIZING_LEADER_BOARD_PREFIX}_${id}`,
      );
    if (
      !isCurrentWaitingForInitializationLeaderBoard &&
      !isCUrrentProcessingInitializationLeaderBoard
    ) {
      const currentSize = await this.redisService.getSortedSetSize(
        WAITING_FOR_INIT_LEADER_BOARD_QUEUE,
      );
      this.redisService.incScoreOfElementInSortedSet(
        WAITING_FOR_INIT_LEADER_BOARD_QUEUE,
        id,
        currentSize + 1,
      );
    }
  }

  private getUserWithScore(data: string[]): {
    userId: number;
    score: number;
  }[] {
    const transformedResult = [];
    for (let i = 0; i < data.length; i += 2) {
      transformedResult.push({
        userId: data[i],
        score: parseFloat(data[i + 1]),
      });
    }
    return transformedResult;
  }

  private async getUserInfo(userIds: number[]) {
    const users = await this.userRepository.findByIds(userIds, {
      select: ['avatar', 'name', 'id'],
    });

    return users.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.id]: {
          avatar: curr.avatar,
          name: curr.name,
        },
      }),
      {},
    );
  }
}
