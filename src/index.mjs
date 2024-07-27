import { Client, IntentsBitField, Events } from "discord.js";
import { config } from "./configs/config.mjs";
import { commands } from "./commands/commands.mjs";

const client = new Client({
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
});


client.commands = await commands();

client.once(Events.ClientReady, () => {
    console.log("Discord bot is ready! 🤖");
});


client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()){
        if (interaction.customId != "rollRandom") return
        interaction.reply({content:"Goodluck, the roles you have rolled are now added to you",ephemeral:true})
    }
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }

});

client.login(config.DISCORD_TOKEN);

export default client