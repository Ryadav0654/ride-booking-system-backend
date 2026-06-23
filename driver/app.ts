import express, { type Express } from "express";

const app: Express = express();

app.get("/", (req, res) => {
  res.send("Hello from user service!");
});

export default app;
