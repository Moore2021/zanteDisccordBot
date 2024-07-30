// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, Collection, Guild } from "discord.js";
import { resetUser } from "../../libs/database.mjs";
import { getRoles, belowStart } from "../../libs/getRoles.mjs";

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

    const MYTHIC = getRoles(`MYTHIC`, interaction.guild);
    const LEGENDARY = getRoles(`LEGENDARY`, interaction.guild);
    const EPIC = getRoles(`EPIC`, interaction.guild);
    const UNCOMMON = getRoles(`UNCOMMON`, interaction.guild);
    const COMMON = getRoles(`COMMON`, interaction.guild);
    const allRoles = new Collection([...MYTHIC, ...LEGENDARY, ...EPIC, ...UNCOMMON, ...COMMON]);
    const allRoleIds = allRoles.map(r => r.id);
    const botsHighestRole = interaction.guild.members.me.roles.highest;
    const roleLowerThanHighest = belowStart(allRoleIds[0], botsHighestRole, interaction.guild);
    const role = interaction.guild.roles.cache.get(allRoleIds[0]);
    if (!roleLowerThanHighest) return interaction.editReply({ content: `Sorry, but the role couldn't be added, please let the owner know the bot's role needs to be higher\n**Role drawn: \`${role.name}\`**`, ephemeral: true });
    const userRoleIds = user.roles.cache.map(r => r.id);
    if (userRoleIds.some(r => allRoleIds.indexOf(r) != -1)) user.roles.remove(allRoleIds);
    return interaction.editReply(`user has been reset`);
}

