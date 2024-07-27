import { Client, IntentsBitField, Events, PermissionFlagsBits } from "discord.js";
import { config } from "./configs/config.mjs";
import { commands } from "./commands/commands.mjs";
import {default as getRole, rarities} from "./configs/roles.mjs";

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
        if (!interaction.guild.members.me.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageRoles)) return await interaction.reply({content:"I dont have permissions to add the role to you rn try again later.",ephemeral:true})
        const allRoles = rarities.flatMap(e=>e.roles)
        if (interaction.member.roles.cache.some(x=> allRoles.includes(x.id))) return await interaction.reply({content:"you have some of the roles already",ephemeral:true})
        const randomRole = getRole();
        interaction.member.roles.add(randomRole)
        await interaction.reply({content:"Goodluck, the roles you have rolled are now added to you",ephemeral:true})
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