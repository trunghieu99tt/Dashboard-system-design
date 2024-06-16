import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { configModuleOptions } from './configs/module-options';
import { DatabaseModule } from './database/database.module';
import { RedisService } from './redis/redis.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    DatabaseModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          redis: {
            host: configService.get<string>('redis.host'),
            port: configService.get<number>('redis.port'),
          },
        };
      },
    }),
  ],
  exports: [ConfigModule, DatabaseModule, RedisService],
  providers: [RedisService],
})
export class SharedModule {}
