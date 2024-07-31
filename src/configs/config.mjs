import "dotenv/config";

let { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_SERVER_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !DISCORD_SERVER_ID) {
  throw new Error(`Missing environment variables`);
}

const DEV_MODE = false;

if (DEV_MODE) {
  const { DISCORD_TOKEN_DEV, DISCORD_CLIENT_ID_DEV } = process.env;

  if (!DISCORD_TOKEN_DEV || !DISCORD_CLIENT_ID_DEV) {
    throw new Error(`Missing environment variables for dev mode`);
  }

  DISCORD_TOKEN = DISCORD_TOKEN_DEV;
  DISCORD_CLIENT_ID = DISCORD_CLIENT_ID_DEV;
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_SERVER_ID,
  DEV_MODE
};