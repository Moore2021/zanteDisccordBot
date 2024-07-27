import 'dotenv/config'

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_SERVER_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !DISCORD_SERVER_ID) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_SERVER_ID
};