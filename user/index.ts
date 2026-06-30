import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { config } from "./config/env";

app.listen(config.port, () => {
  console.log(
    `User Service is running on port ${config.port} [${config.nodeEnv}]`
  );
});
