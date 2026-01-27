import * as dotenv from 'dotenv';
dotenv.config();
import { buildApp } from './app.js';
import { config } from './config/env.js';

const start = async () => {
  try {
    const app = await buildApp();
    await app.listen({
      port: config.server.port,
      host: config.server.host,
    });
    console.log(`Server listening on http://${config.server.host}:${config.server.port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
