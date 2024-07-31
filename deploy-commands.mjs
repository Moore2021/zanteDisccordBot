import { REST, Routes } from "discord.js";
import { config } from "./src/configs/config.mjs";
import { commands } from "./src/commands/commands.mjs";

const commandData = await commands();
const commandsData = commandData.map((command) => command.data.toJSON());

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

const DEV_MODE_RESET = false;

async function deployCommands() {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_SERVER_ID),
      {
        body: DEV_MODE_RESET ? [] : commandsData,
      }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

await deployCommands()