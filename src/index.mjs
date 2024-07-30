import { Client, IntentsBitField, Events, PermissionFlagsBits, Collection } from "discord.js";
import { config } from "./configs/config.mjs";
import { commands } from "./commands/commands.mjs";
import { default as getRole, getRarities } from "./configs/roles.mjs";
import { default as query, roleAssigned, updateRecord, validateUser } from "./libs/database.mjs";
import { belowStart } from "./libs/getRoles.mjs";

const client = new Client({
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.GuildMembers],
});


client.commands = await commands();
client.dbQuery = (text, values) => query(text, values);

client.once(Events.ClientReady, () => {
    console.log(`Discord bot is ready! 🤖`);
});

client.on(Events.GuildMemberAdd, async (member) => {

    const userExists = await validateUser(member.id);
    if (!userExists) return;
    if (!userExists.roll_assigned) return;
    if (!userExists.roll_id) return;
    const guild = member.guild;
    const roleId = userExists.roll_id;
    const hasPermission = guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles);
    if (!hasPermission) return;
    const cacheHasRole = guild.roles.cache.has(roleId);
    if (!cacheHasRole) return;
    const botsHighestRole = guild.members.me.roles.highest;
    const roleLowerThanHighest = belowStart(roleId, botsHighestRole, guild);
    if (!roleLowerThanHighest) return;
    return member.roles.add(roleId);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
        await interaction.deferReply({ ephemeral: true })
        const guild = interaction.guild;
        if (interaction.customId === `gachaAddictButton`) {
            if (!guild.members.me.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageRoles)) return await interaction.editReply({ content: `I dont have permissions to add the role to you rn try again later.`, ephemeral: true });
            const randomRole = getRole(guild);
            if (!randomRole.result) return await interaction.editReply({ content: `Sorry, but there are no roles supplied for that rarity yet.\nRarity drawn: **\`${randomRole.rarity}\`**`, ephemeral: true });
            const roleId = randomRole.randomRole;
            if (guild.roles.cache.has(roleId)) {
                const role = guild.roles.cache.get(roleId);
                return await interaction.editReply({ content: `**Role drawn: \`${randomRole.rarity}\`**\n**Role drawn: \`${role.name}\`**`, ephemeral: true });
            } else {
                return await interaction.editReply({ content: `Sorry, but the role has been edited or removed\nRarity drawn: **\`${randomRole.rarity}\`**`, ephemeral: true });
            }
        }
        if (interaction.customId != `rollRandom`) return;

        const userAlreadyAssigned = await roleAssigned(interaction.member.id);
        if (userAlreadyAssigned) return await interaction.editReply({ content: `Please ask to be reset as you already have been assigned a role.`, ephemeral: true });
        if (!guild.members.me.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageRoles)) return await interaction.editReply({ content: `I dont have permissions to add the role to you rn try again later.`, ephemeral: true });
        const randomRole = getRole(guild);
        const allRoles = getRarities(guild).flatMap(e => e.roles);
        const allRoleIds = new Collection(allRoles.reduce((a, c) => a.concat([...c]), [])).map(r => r.id);
        if (interaction.member.roles.cache.some(x => allRoleIds.includes(x.id))) return await interaction.editReply({ content: `you have some of the roles already`, ephemeral: true });
        if (!randomRole.result) return await interaction.editReply({ content: `Sorry, but there are no roles supplied for that rarity yet.\nRarity drawn: **\`${randomRole.rarity}\`**`, ephemeral: true });
        const roleId = randomRole.randomRole;
        if (guild.roles.cache.has(roleId)) {
            const role = guild.roles.cache.get(roleId);
            const botsHighestRole = guild.members.me.roles.highest;
            const roleLowerThanHighest = belowStart(roleId, botsHighestRole, guild);
            if (!roleLowerThanHighest) return await interaction.editReply({ content: `Sorry, but the role couldn't be added, please let the owner know the bot's role needs to be higher\n**Role drawn: \`${role.name}\`**`, ephemeral: true });
            interaction.member.roles.add(roleId);
            const result = await updateRecord(interaction.member.id, roleId);
            if (!result) console.error(`Record not added to database for user: ${interaction.member.id} with roll: ${roleId}`);
            return await interaction.editReply({ content: `Goodluck, the roles you have rolled are now added to you`, ephemeral: true });
        } else {
            return await interaction.editReply({ content: `Sorry, but the role has been edited or removed\nRarity drawn: **\`${randomRole.rarity}\`**`, ephemeral: true });
        }
    }
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: `There was an error while executing this command!`, ephemeral: true });
        } else {
            await interaction.reply({ content: `There was an error while executing this command!`, ephemeral: true });
        }
    }
});

client.login(config.DISCORD_TOKEN);

export default client;