import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import { Context, Handler } from 'aws-lambda';
import express from 'express';
import { AppModule } from './app.module';
import { SecretsManager } from 'aws-sdk';

let cachedServer: Handler;

async function loadSecrets() {
  if (process.env.SECRETS_ARN) {
    const secretsManager = new SecretsManager({ region: process.env.AWS_REGION });
    try {
      const data = await secretsManager.getSecretValue({ SecretId: process.env.SECRETS_ARN }).promise();
      const secrets = JSON.parse(data.SecretString || '{}');
      Object.keys(secrets).forEach(key => {
        process.env[key] = secrets[key];
      });
    } catch (error) {
      console.error('Failed to load secrets:', error);
    }
  }
}

async function bootstrap(): Promise<Handler> {
  if (!cachedServer) {
    await loadSecrets();
    
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: ['error', 'warn'] }
    );
    
    nestApp.enableCors();
    await nestApp.init();
    
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer;
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: any,
) => {
  const server = await bootstrap();
  return server(event, context, callback);
};