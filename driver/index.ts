import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { config } from "./src/config/env.js";

app.listen(config.port, () => {
  console.log(`Driver Service running on port ${config.port}`);
});
