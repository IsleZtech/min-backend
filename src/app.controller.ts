import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health')
  health(): string {
    return 'OK';
  }

  @Get('/test')
  testEnv(): string {
    return `NODE_ENV=${this.configService.get('NODE_ENV')};PORT=${this.configService.get(
      'PORT',
    )};URL=${this.configService.get('MONGO_DB_CONNECTION')};`;
  }
}
