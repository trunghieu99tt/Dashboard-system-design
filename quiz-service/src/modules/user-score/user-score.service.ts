import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { plainToClass } from 'class-transformer';
import { UpdateUserScoreInput } from './dto/update-user-score-input.dto';
import { UserScoreRepository } from './user-score.repository';
import { UserScore } from './user-score.entity';
import { UserScoreEventRepository } from '../user-score-event/user-score-event.repository';
import { UserScoreEvent } from '../user-score-event/user-score-event.entity';
import { UserScoreEventType } from '../user-score-event/user-score-event.enum';

@Injectable()
export class UserScoreService {
  constructor(
    private readonly userScoreRepository: UserScoreRepository,
    private readonly userScoreEventRepository: UserScoreEventRepository,
  ) {}

  @Transactional()
  async updateScore(updateUserScoreInput: UpdateUserScoreInput) {
    const { userId, quizId, score } = updateUserScoreInput;
    const quizScore = await this.userScoreRepository.findOne(
      {
        userId,
        quizId,
      },
      {
        lock: {
          mode: 'pessimistic_write',
        },
      },
    );
    if (!quizScore) {
      // At this point we should check for existence of user and quiz as well before creating a new one.
      // But for simplicity, we assume that they're valid
      await this.userScoreRepository.insert(
        plainToClass(UserScore, {
          userId,
          quizId,
          score,
        }),
      );
    } else {
      quizScore.score = quizScore.score + score;
      this.userScoreRepository.save(quizScore);
    }

    this.userScoreEventRepository.insert(
      plainToClass(UserScoreEvent, {
        userId,
        quizId,
        score,
        eventType: UserScoreEventType.ADD_SCORE,
      }),
    );
  }
}
