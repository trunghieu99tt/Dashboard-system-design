import { BaseEntity } from '../../shared/entity/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'user_name',
  })
  userName: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  avatar: string;

  @Column()
  email: string;
}
