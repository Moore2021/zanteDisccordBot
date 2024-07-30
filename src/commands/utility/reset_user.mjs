// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, Collection } from "discord.js";
import { resetUser } from "../../libs/database.mjs";
import { getRarities, belowStart } from "../../configs/roles.mjs";

export const data = new SlashCommandBuilder()
    .setName(`reset_user`)
    .setDescription(`reset user to allow them to reroll`)
    .addUserOption(option =>
        option
            .setName(`user`)
            .setDescription(`user to reset`)
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const user = interaction.options.getMember(`user`, true);
    const userId = user.id;
    const hasPermission = interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles);
    if (!hasPermission) return interaction.editReply({ content: `I current dont have permission to add role to user`, ephemeral: true });
    const result = await resetUser(userId);
    if (!result) return interaction.editReply({ content: `I was unable to reset the user.`, ephemeral: true });
    const allRoles = getRarities().flatMap(e => e.roles);
    const allRoleIds = new Collection(allRoles.reduce((a, c) => a.concat([...c]), [])).map(r => r.id);
    const botsHighestRole = interaction.guild.members.me.roles.highest;
    const roleLowerThanHighest = belowStart(allRoleIds[0], botsHighestRole);
    const role = interaction.guild.roles.cache.get(allRoleIds[0]);
    if (!roleLowerThanHighest) return await interaction.reply({ content: `Sorry, but the role couldn't be added, please let the owner know the bot's role needs to be higher\n**Role drawn: \`${role.name}\`**`, ephemeral: true });
    user.roles.remove(allRoleIds);
    return;
}