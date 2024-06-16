import { BaseEntity } from '../../shared/entity/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  UserScoreEventStatus,
  UserScoreEventType,
} from './user-score-event.enum';

@Entity('user_score_event')
export class UserScoreEvent extends BaseEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'quiz_id',
  })
  quizId: number;

  @Column({
    name: 'user_id',
  })
  userId: number;

  @Column({
    type: 'enum',
    enum: UserScoreEventStatus,
    default: UserScoreEventStatus.UNPROCESSED,
  })
  status: string;

  @Column({
    type: 'enum',
    enum: UserScoreEventType,
    name: 'event_type',
  })
  eventType: string;

  @Column()
  score: number;
}
