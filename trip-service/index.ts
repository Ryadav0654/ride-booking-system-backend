import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { config } from "./src/config/env.js";
import { kafkaProducerService } from "./src/events/kafka-producer.js";
import { logger } from "./src/utils/logger.js";

async function bootstrap() {
  // Establish connection with Kafka Broker
  await kafkaProducerService.connect();

  app.listen(config.port, () => {
    logger.info(
      { port: config.port, env: config.nodeEnv },
      "Trip Service started"
    );
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, "Critical error during bootstrap");
  process.exit(1);
});
