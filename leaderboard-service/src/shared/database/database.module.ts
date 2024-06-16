import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizRepository } from 'src/modules/quiz/quiz.repository';
import { UserScoreRepository } from 'src/modules/user-score/user-score.repository';
import { UserRepository } from 'src/modules/user/user.repository';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';

initializeTransactionalContext();
patchTypeORMRepositoryWithBaseRepository();

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('database.host'),
          port: configService.get<number | undefined>('database.port'),
          database: configService.get<string>('database.name'),
          username: configService.get<string>('database.user'),
          password: configService.get<string>('database.pass'),
          entities: [__dirname + '/../../**/**/*.entity{.ts,.js}'],
          timezone: 'Z',
          synchronize: false,
          logging: true,
          subscribers: [__dirname + '/../../**/**/*.subscriber{.ts,.js}'],
        };
      },
    }),
    TypeOrmModule.forFeature([
      UserScoreRepository,
      QuizRepository,
      UserRepository,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
