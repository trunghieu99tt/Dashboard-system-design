import { BaseEntity } from '../../shared/entity/base.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_score')
export class UserScore extends BaseEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
  })
  id: number;

  @Index()
  @Column({
    name: 'quiz_id',
  })
  quizId: number;

  @Index()
  @Column({
    name: 'user_id',
  })
  userId: number;

  @Column()
  score: number;
}
