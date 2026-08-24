import { Kafka, type Producer } from "kafkajs";
import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";

class KafkaProducerService {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: config.kafkaClientId,
      brokers: config.kafkaBrokers,
      // Configure low retry/timeout values for dev environment
      connectionTimeout: 3000,
      retry: {
        retries: 2,
      },
    });
    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    try {
      logger.info(
        { brokers: config.kafkaBrokers },
        "Connecting Kafka producer..."
      );

      await this.producer.connect();
      this.isConnected = true;
      logger.info("Kafka producer connected successfully");
    } catch (error) {
      logger.warn(
        { err: error },
        "Failed to connect Kafka producer. Running in simulated local event mode."
      );
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.producer.disconnect();
        logger.info("Kafka producer disconnected");
      } catch (error) {
        logger.error({ err: error }, "Error disconnecting Kafka producer");
      }
      this.isConnected = false;
    }
  }

  async publish(topic: string, event: any): Promise<void> {
    if (!this.isConnected) {
      logger.info(
        { topic, event },
        "Kafka-Simulation: event published (broker offline)"
      );
      return;
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.tripId,
            value: JSON.stringify(event),
          },
        ],
      });
      logger.info(
        { topic, tripId: event.tripId },
        "Successfully published event to Kafka"
      );
    } catch (error) {
      logger.error(
        { err: error, topic, tripId: event.tripId },
        "Failed to publish event to Kafka"
      );
      throw error;
    }
  }
}

export const kafkaProducerService = new KafkaProducerService();
