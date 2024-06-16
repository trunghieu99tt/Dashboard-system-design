import { EntityRepository, Repository } from 'typeorm';
import { UserScore } from './user-score.entity';

@EntityRepository(UserScore)
export class UserScoreRepository extends Repository<UserScore> {}
