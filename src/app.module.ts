import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'config/configuration';
import { UserModule } from './user/user.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { BlockModule } from './block/block.module';
import { DeleteModule } from './delete/delete.module';
import { ReportModule } from './report/report.module';
import { MatchModule } from './match/match.module';
import { ChatLogModule } from './chat_log/chat_log.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: process.env.MONGO_URL,
        // config.get<string>('MONGO_DB_CONNECTION'),
      }),
    }),
    UserModule,
    BlockModule,
    MatchModule,
    ChatLogModule,
    DeleteModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
