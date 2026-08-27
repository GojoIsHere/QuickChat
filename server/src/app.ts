import cors from "cors";
import express from "express";

export const createApp = (clientUrl: string) => {
  const app = express();

  app.use(
    cors({
      origin: clientUrl,
    })
  );

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      message: "QuickChat server is running 🚀",
    });
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
    });
  });

  return app;
};