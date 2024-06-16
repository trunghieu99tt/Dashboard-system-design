import { BaseEntity } from '../../shared/entity/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { QuizStatus } from './quiz.enum';

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

  @Column({
    name: 'created_by',
  })
  createdBy: string;

  @Column({
    name: 'updated_by',
    nullable: true,
  })
  updatedBy: string;
}
