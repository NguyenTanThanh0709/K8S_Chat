import http from "http";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import { InitializeBroker } from "./services/broker.service";
import { initializeSocketServer } from "./socket/socket";
import { initializeVideoSocketServer } from "./socket/video-socket-server";

dotenv.config();

const app = express();
const server = http.createServer(app);

async function bootstrap() {
  app.use(express.json());
  app.use(cookieParser());

  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
  }));

  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  await InitializeBroker();
await initializeSocketServer(io);        // 🔄 Truyền io
await initializeVideoSocketServer(io);   // 🔄 Truyền io (dùng io.of("/video-socket"))

  const PORT = 8182;
  server.listen(PORT, () => {
    console.log(`🚀 Socket service listening on port ${PORT}`);
  });
}

bootstrap().catch(console.error);
