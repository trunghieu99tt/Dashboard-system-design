import { EntityRepository, Repository } from 'typeorm';
import { UserScoreEvent } from './user-score-event.entity';

@EntityRepository(UserScoreEvent)
export class UserScoreEventRepository extends Repository<UserScoreEvent> {}
