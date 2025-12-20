/* eslint-disable no-console */
import { createClient } from "redis";
import { envVars } from "./env";

export let redisClient: ReturnType<typeof createClient> | null = null;

export const connectRedis = async () => {
  if (!envVars.REDIS_HOST || !envVars.REDIS_PORT) {
    console.warn("⚠️ Redis env missing. Skipping Redis.");
    return;
  }

  console.log("🔍 Using Redis Host:", envVars.REDIS_HOST);

  try {
    const client = createClient({
      url: `rediss://${envVars.REDIS_USERNAME}:${envVars.REDIS_PASSWORD}@${envVars.REDIS_HOST}:${envVars.REDIS_PORT}`,
      socket: {
        reconnectStrategy: false,
      },
    });

    // log only once
    client.once("error", (err) => {
      console.warn("⚠️ Redis unavailable:", err.message);
    });

    await client.connect();

    redisClient = client;
    console.log("✅ Redis Connected");
  } catch (error) {
    console.warn("⚠️ Redis connection failed. Continuing without Redis.");
    redisClient = null;
  }
};
