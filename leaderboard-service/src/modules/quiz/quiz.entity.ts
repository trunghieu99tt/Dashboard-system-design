import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { QuizStatus } from './quiz.enum';
import { BaseEntity } from '../../shared/entity/base.entity';

@Entity()
export class Quiz extends BaseEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
  })
  id: number;

  @Column({ length: 100, nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: QuizStatus,
  })
  status: string;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;
}
