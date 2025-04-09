import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

import routeAuth from './routes/auth.routes.js'
import routeUser from './routes/user.routes.js'
import routeLvl from './routes/level.routes.js'
import routeGame from './routes/game.routes.js'
import routeTask from './routes/task.routes.js'
import routeWallet from './routes/wallet.routes.js'
import routeLeaderBoard from './routes/leaderboard.routes.js'
import http from "http";

export const run = async (): Promise<void> => {
  const app: Express = express();

  app.use(cors());

  app.use(function (_req: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
    );
    next();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint for Render and monitoring
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      message: 'JOR Play Live Bot is running',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/auth', routeAuth)
  app.use('/user', routeUser)
  app.use('/level', routeLvl)
  app.use('/game', routeGame)
  app.use('/task', routeTask)
  app.use('/wallet', routeWallet)
  app.use('/leaderboard', routeLeaderBoard)

  const port = process.env.PORT;

  let server = http.createServer(app);
  server.listen(port, () => {
    console.log(`Server up and running on port ${port} with HTTPS!`);
  });

  // console.log(`Server up and running on port ${port} !`);
  // app.listen(port);
};
